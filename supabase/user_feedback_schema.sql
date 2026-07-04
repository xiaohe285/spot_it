-- =====================================================
-- User Feedback Table
-- =====================================================
-- Stores user feedback (e.g. game search suggestions).
-- Rate-limited to one submission per IP per day at API layer.

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL, -- e.g. 'new_game'
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_ip_created
  ON user_feedback(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id
  ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type
  ON user_feedback(feedback_type);

-- =====================================================
-- Row Level Security
-- =====================================================
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Insert is performed via Next.js API route which enforces IP rate limiting.
-- Allow inserts from any client (rate limit is enforced server-side).
CREATE POLICY "Anyone can submit feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (true);

-- Allow authenticated user to view their own feedback.
CREATE POLICY "Users can view their own feedback"
  ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);
