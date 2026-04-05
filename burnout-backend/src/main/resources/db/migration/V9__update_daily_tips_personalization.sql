-- V9: Update daily_tips table for personalization
-- Add user_id column
ALTER TABLE daily_tips ADD COLUMN user_id UUID;

-- Remove the unique constraint on display_date to allow different tips for different users on the same day
ALTER TABLE daily_tips DROP CONSTRAINT IF EXISTS daily_tips_display_date_key;

-- Add index for performance on user-specific daily lookups
CREATE INDEX idx_daily_tips_user_date ON daily_tips(user_id, display_date);

-- Update existing tips to be "global" (system-wide) by having NULL user_id
-- No action needed as NULL is the default for new columns
