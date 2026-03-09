/**
 * Run with:  npx tsx test-auth.ts
 * Install:   npm install -D tsx
 */

import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


const SUPABASE_URL = environment.supabaseUrl
const SUPABASE_ANON_KEY = environment.supabaseKey;
const TEST_EMAIL = 'guest@join.de';
const TEST_PASSWORD = 'Test1234!';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('\n── signUp ──');
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: TEST_EMAIL, password: TEST_PASSWORD });
  console.log(signUpErr ? `❌ ${signUpErr.message}` : `✅ User ID: ${signUpData.user?.id}`);

  console.log('\n── signIn ──');
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
  console.log(signInErr ? `❌ ${signInErr.message}` : `✅ Token: ${signInData.session?.access_token.substring(0, 30)}...`);

  console.log('\n── getSession ──');
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  console.log(sessionErr ? `❌ ${sessionErr.message}` : `✅ Active: ${!!sessionData.session}`);

  console.log('\n── signOut ──');
  const { error: signOutErr } = await supabase.auth.signOut();
  console.log(signOutErr ? `❌ ${signOutErr.message}` : '✅ Signed out');

  const { data: check } = await supabase.auth.getSession();
  console.log(`   Session cleared: ${!check.session}\n`);
}

run();
