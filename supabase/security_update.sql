-- =====================================================
-- Security Update: Restrict Content Management
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This script:
-- 1. Adds admin role support to profiles
-- 2. Removes public write access to categories and levels
-- 3. Adds admin-only policies for future admin dashboard
-- https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- 1. Add Admin Field to Profiles
-- =====================================================

-- Add is_admin column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- =====================================================
-- 2. Update User Creation Function
-- =====================================================

-- Update the handle_new_user function to include is_admin field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    false  -- New users are not admins by default
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Remove Public Write Access to Categories
-- =====================================================

-- Drop existing write policies for categories
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- Create admin-only policies for categories
CREATE POLICY "Admin users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin users can update categories"
  ON categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin users can delete categories"
  ON categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 4. Remove Public Write Access to Levels
-- =====================================================

-- Drop existing write policies for levels
DROP POLICY IF EXISTS "Authenticated users can insert levels" ON levels;
DROP POLICY IF EXISTS "Authenticated users can update levels" ON levels;
DROP POLICY IF EXISTS "Authenticated users can delete levels" ON levels;

-- Create admin-only policies for levels
CREATE POLICY "Admin users can insert levels"
  ON levels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin users can update levels"
  ON levels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin users can delete levels"
  ON levels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 5. Verification Queries (Optional - Run to Check)
-- =====================================================

-- Check if any existing users should be set as admin
-- IMPORTANT: Manually update your admin user after running this script
-- Example: UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

-- To check current policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('categories', 'levels')
-- ORDER BY tablename, policyname;

-- =====================================================
-- Done! 🎉
-- =====================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Set your user as admin (if needed):
--    UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
-- 3. Verify that regular users cannot modify categories/levels
-- 4. Verify that you can still manage content via Supabase Dashboard
-- =====================================================
