// ================================
// SANCTUARY — supabase-client.js
// Version navigateur
// ================================

const SUPABASE_URL = 'https://craxyrbklfijqoaqxqem.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYXh5cmJrbGZpanFvYXF4cWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTExMDg0OCwiZXhwIjoyMTA0Njg2ODQ4fQ.5Gl3FdEsz61ran2c68zaT4-lpo0AC4g6cFAYFLdrAzQ';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);