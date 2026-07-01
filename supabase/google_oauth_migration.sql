-- =====================================================
-- Google OAuth Support Migration
-- =====================================================
-- Run this SQL in your Supabase SQL Editor AFTER schema.sql
-- https://supabase.com/dashboard/project/_/sql
--
-- 目的：
-- 1. 更新 handle_new_user trigger，支持 Google OAuth 提供的元数据
--    (full_name, name, avatar_url, picture)
-- 2. 使用 ON CONFLICT 确保用户与已存在 profile 的关联幂等
-- 3. 添加 sync trigger，在已有用户通过 Google 登录后同步头像/昵称
--
-- 账号关联说明：
-- Supabase 默认启用 "Link identities to same email" 特性。
-- 当已存在的 email 用户使用同 email 的 Google 账号登录时，
-- Supabase 会自动将 Google identity 关联到已有 auth.users 记录上，
-- user_id 保持不变，因此 profile / game_records 等业务数据会自动关联。
-- 注意：需要在 Supabase Dashboard > Authentication > Providers > Google
-- 中启用 Google Provider，并配置 Client ID / Secret。
-- =====================================================

-- =====================================================
-- 1. 更新 handle_new_user 函数
-- =====================================================
-- 当新用户创建时（包括 Google OAuth 首次登录），创建 profile
-- 兼容 Google 元数据字段（full_name / name / avatar_url / picture）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_display_name TEXT;
  v_username TEXT;
  v_avatar_url TEXT;
BEGIN
  -- 从元数据中提取显示名称：优先 username -> display_name -> full_name -> name -> email 前缀
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- username：优先使用元数据中的 username，否则使用 email 前缀
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- 头像：优先 avatar_url -> picture (Google 返回的字段)
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (NEW.id, v_username, v_display_name, v_avatar_url)
  ON CONFLICT (id) DO UPDATE
  SET
    -- 仅在原字段为空时补齐信息，避免覆盖用户手动设置的资料
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重新创建 trigger（若已存在会被替换）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. 用户资料同步：当已有用户通过 Google 登录时同步头像
-- =====================================================
-- 当已存在的用户新增 identity（例如 Google 账号关联到已有邮箱账户）时，
-- 同步 Google 头像/名称到 profile（前提是 profile 中对应字段为空）
CREATE OR REPLACE FUNCTION public.handle_identity_linked()
RETURNS TRIGGER AS $$
DECLARE
  v_avatar_url TEXT;
  v_display_name TEXT;
BEGIN
  -- identity_data 是 jsonb，Google 会写入 avatar_url / picture / full_name / name
  v_avatar_url := COALESCE(
    NEW.identity_data->>'avatar_url',
    NEW.identity_data->>'picture'
  );

  v_display_name := COALESCE(
    NEW.identity_data->>'full_name',
    NEW.identity_data->>'name'
  );

  IF v_avatar_url IS NOT NULL OR v_display_name IS NOT NULL THEN
    UPDATE public.profiles
    SET
      avatar_url = COALESCE(profiles.avatar_url, v_avatar_url),
      display_name = COALESCE(profiles.display_name, v_display_name),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_identity_created ON auth.identities;
CREATE TRIGGER on_auth_identity_created
  AFTER INSERT ON auth.identities
  FOR EACH ROW EXECUTE FUNCTION public.handle_identity_linked();

-- =====================================================
-- 3. 为 profiles 表补齐 avatar_url 索引（可选）
-- =====================================================
-- 无实际必要，但保留一个 ID 索引已足够。
-- 如需回滚，删除上述 trigger 与 function 即可。

-- =====================================================
-- Done! 🎉
-- =====================================================
