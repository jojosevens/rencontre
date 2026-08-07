-- SQL schema for THEOTOKOS (Postgres compatible)

-- Users table (if using own backend)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_verified BOOLEAN DEFAULT FALSE
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- matches users.id or supabase auth uid
  first_name TEXT,
  last_name TEXT,
  age INT,
  bio TEXT,
  country TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  room UUID REFERENCES rooms(id) ON DELETE SET NULL,
  room_name TEXT,
  author_id UUID,
  author TEXT,
  text TEXT,
  ts BIGINT
);
