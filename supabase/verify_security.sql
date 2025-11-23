-- =====================================================
-- Security Verification Queries
-- =====================================================
-- Run these queries in Supabase SQL Editor to verify
-- the security update was applied correctly

-- =====================================================
-- 1. Check if is_admin column exists
-- =====================================================
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'is_admin';

-- Expected: Should return one row with is_admin column

-- =====================================================
-- 2. Check all policies on categories table
-- =====================================================
SELECT
  policyname,
  cmd,
  permissive,
  CASE
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as operation
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd, policyname;

-- Expected output:
-- - "Categories are viewable by everyone" (SELECT)
-- - "Admin users can insert categories" (INSERT)
-- - "Admin users can update categories" (UPDATE)
-- - "Admin users can delete categories" (DELETE)

-- =====================================================
-- 3. Check all policies on levels table
-- =====================================================
SELECT
  policyname,
  cmd,
  permissive,
  CASE
    WHEN cmd = 'SELECT' THEN 'Read'
    WHEN cmd = 'INSERT' THEN 'Create'
    WHEN cmd = 'UPDATE' THEN 'Update'
    WHEN cmd = 'DELETE' THEN 'Delete'
  END as operation
FROM pg_policies
WHERE tablename = 'levels'
ORDER BY cmd, policyname;

-- Expected output:
-- - "Published levels are viewable by everyone" (SELECT)
-- - "Admin users can insert levels" (INSERT)
-- - "Admin users can update levels" (UPDATE)
-- - "Admin users can delete levels" (DELETE)

-- =====================================================
-- 4. Check current admin users
-- =====================================================
SELECT
  id,
  username,
  display_name,
  is_admin,
  created_at
FROM profiles
WHERE is_admin = true;

-- Expected: Should be empty (no admins yet) or show your admin account

-- =====================================================
-- 5. Count total users and admins
-- =====================================================
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_admin = true) as admin_users,
  COUNT(*) FILTER (WHERE is_admin = false) as regular_users
FROM profiles;

-- Expected: Shows user distribution

-- =====================================================
-- 6. Verify old policies were removed
-- =====================================================
SELECT
  policyname,
  tablename
FROM pg_policies
WHERE tablename IN ('categories', 'levels')
  AND policyname LIKE '%Authenticated users%';

-- Expected: Should return 0 rows (old policies removed)

-- =====================================================
-- Summary Report
-- =====================================================
-- This query provides a summary of the security configuration
SELECT
  'Categories Table' as table_name,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as read_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'categories'

UNION ALL

SELECT
  'Levels Table' as table_name,
  COUNT(*) FILTER (WHERE cmd = 'SELECT') as read_policies,
  COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
  COUNT(*) FILTER (WHERE cmd = 'DELETE') as delete_policies,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'levels';

-- Expected for both tables:
-- read_policies: 1
-- insert_policies: 1
-- update_policies: 1
-- delete_policies: 1
-- total_policies: 4
