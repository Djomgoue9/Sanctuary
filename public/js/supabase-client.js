// ================================
// SANCTUARY — supabase-client.js
// Version navigateur
// ================================

const SUPABASE_URL = 'https://craxyrbklfijqoaqxqem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_BDjYTNdMew59fcFnPgz4mg_Jwmfb0EZ';

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);