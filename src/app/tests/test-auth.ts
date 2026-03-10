/**
 * Run with:  npx tsx test-auth.ts
 * Install:   npm install -D tsx
 *
 * Note: Auth user cleanup must be done manually via the Supabase Dashboard.
 */

import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

const TEST_EMAIL = 'walter.meier@join.de';
const TEST_PASSWORD = 'waltersPasswort!!';
const TEST_NAME = 'Walter Meier';

function randomColor(): string {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}


/** Mirrors ContactsDb.setContact() @see src/app/core/db/contacts.db.ts */
async function setContact(contact: { name: string; email: string; phone?: string; color: string }) {
  const { data, error } = await supabase.from('contacts').insert([{ ...contact }]).select();
  if (error) throw error;
  return data;
}


async function test(label: string, fn: () => Promise<string>) {
  try { console.log(`${label}: ${await fn()}`); }
  catch (e: any) { console.log(`${label}: ❌ ${e.message}`); }
}


async function run() {
  await test('signUp', async () => {
    const { data, error } = await supabase.auth.signUp({ email: TEST_EMAIL, password: TEST_PASSWORD });
    if (error) throw error;
    return `✅ User ID: ${data.user?.id}`;
  });


  await test('createContact', async () => {
    const data = await setContact({ name: TEST_NAME, email: TEST_EMAIL, color: randomColor() });
    return `✅ Contact ID: ${data?.[0]?.id}`;
  });


  await test('doubleSignUp', async () => {
    const { data, error } = await supabase.auth.signUp({ email: TEST_EMAIL, password: TEST_PASSWORD });
    if (error) return `❌ Rejected: ${error.message}`;
    if (!data.user?.identities?.length) return '❌ Rejected: user already exists';
    return '❌ Double sign-up was not rejected!';
  });


  await test('signIn', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
    if (error) throw error;
    return `✅ Token: ${data.session?.access_token.substring(0, 30)}...`;
  });


  await test('getSession', async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return `✅ Active: ${!!data.session}`;
  });


  await test('signOut', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    const { data: check } = await supabase.auth.getSession();
    return `✅ Signed out — session cleared: ${!check.session}`;
  });
}

run();
