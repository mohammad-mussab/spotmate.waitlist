-- Waitlist Table for Spotmate Landing Page
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
DROP POLICY IF EXISTS "Anyone can view waitlist" ON waitlist;

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT,  -- Full WhatsApp number with country code (e.g., "+923001234567")
  country TEXT NOT NULL,  -- ISO 2-letter code (e.g., "PK", "US")
  country_name TEXT NOT NULL,  -- Full country name
  city TEXT NOT NULL,
  area TEXT NOT NULL,  -- Area/neighborhood
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (join waitlist)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (for counts)
CREATE POLICY "Anyone can view waitlist" ON waitlist
  FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_whatsapp ON waitlist(whatsapp_number) WHERE whatsapp_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_city ON waitlist(city);
CREATE INDEX IF NOT EXISTS idx_waitlist_country ON waitlist(country);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at DESC);

-- View to get waitlist counts by city
CREATE OR REPLACE VIEW waitlist_city_counts AS
SELECT
  city,
  country_name,
  COUNT(*) as total_signups,
  COUNT(whatsapp_number) as whatsapp_signups,
  COUNT(*) - COUNT(whatsapp_number) as email_only_signups,
  MIN(created_at) as first_signup,
  MAX(created_at) as latest_signup
FROM waitlist
GROUP BY city, country_name
ORDER BY total_signups DESC;

-- View to get WhatsApp numbers for a specific city (for launching)
CREATE OR REPLACE VIEW waitlist_whatsapp_contacts AS
SELECT
  city,
  name,
  whatsapp_number,
  email,
  created_at
FROM waitlist
WHERE whatsapp_number IS NOT NULL
ORDER BY city, created_at;

-- Comments
COMMENT ON TABLE waitlist IS 'Stores email signups for Spotmate waitlist (landing page with optional WhatsApp)';
COMMENT ON VIEW waitlist_city_counts IS 'Shows signup counts by city, split by WhatsApp vs email-only';
COMMENT ON VIEW waitlist_whatsapp_contacts IS 'Lists all users who provided WhatsApp numbers, for messaging when city launches';
