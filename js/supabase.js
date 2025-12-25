import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://rzwazgxhqnggxbzmvqic.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6d2F6Z3hocW5nZ3hiem12cWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Nzc1NjMsImV4cCI6MjA4MjE1MzU2M30.UaNVaWFgMZDxnxouSor1Sby2pwSvB6zjKzvXSi-qSgg";

export const ADMIN_EMAIL = "ludo.consulting3@gmail.com";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
