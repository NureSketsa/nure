-- NURE Database Schema
-- Paste this into the Supabase SQL editor and run it.

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Daily habit definitions
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text default '✦',
  created_at timestamp with time zone default now()
);

-- Which habits were completed on which day
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  completed_date date not null,
  created_at timestamp with time zone default now(),
  unique(habit_id, completed_date)
);

-- Todo tasks
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default 'personal',
  due_date date,
  priority text default 'medium',
  status text default 'todo',
  created_at timestamp with time zone default now()
);

-- Calendar events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time time,
  notes text,
  category text,
  color text default '#f5a623',
  created_at timestamp with time zone default now()
);

-- Journal entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  entry_date date not null,
  went_well text,
  to_improve text,
  grateful_for text,
  created_at timestamp with time zone default now()
);

-- Saved links
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  category text default 'Other',
  emoji text default '🔗',
  created_at timestamp with time zone default now()
);

-- Disable RLS for personal use (single user, no auth)
alter table habits disable row level security;
alter table habit_logs disable row level security;
alter table todos disable row level security;
alter table events disable row level security;
alter table journal_entries disable row level security;
alter table links disable row level security;