// ================================
// SANCTUARY — supabase-client.js
// Version navigateur
// ================================

const SUPABASE_URL = 'https://craxyrbklfijqoaqxqem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXh5cmJrbGZpanFvYXF4cWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMTA4NDgsImV4cCI6MjEwNDY4Njg0OH0.HtjmP1oyBfrnxhG3NkFQKeYyQ3L5HvE1I2OhMEZV40I';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);