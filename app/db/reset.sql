-- Drop everything (local reset). Order respects FK dependencies.
-- Content lives in git now; D1 holds identity only.
DROP TABLE IF EXISTS page_groups;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS user_groups;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS groups;
