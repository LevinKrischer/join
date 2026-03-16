import { Injectable, signal } from '@angular/core';
import { AuthChangeEvent, Session, createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { decodeUserContactPhone, encodeUserContactPhone, isUserContactPhone } from '../core/utils/user-contact-marker';

@Injectable({ providedIn: 'root' })

export class SupabaseService {
  private supabase: SupabaseClient;
  userName = signal('');

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * Returns the initialized Supabase client.
   * Used by other services to perform database queries, authentication,
   * storage operations, and realtime subscriptions.
   */
  get client() {
    return this.supabase;
  }

  /**
   * Registers a new user with the given email and password.
   * @param email - The user's email address.
   * @param password - The user's chosen password.
   * @returns The Supabase sign-up response.
   */
  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  /**
   * Signs in a user and fetches their display name from the `contacts` table.
   * On success the userName signal is updated.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing any auth error and the resolved user name.
   */
  async signIn(email: string, password: string) {
    const res = await this.supabase.auth.signInWithPassword({ email, password });

    if (!res.error && res.data.user) {
      await this.ensureCurrentUserContactMarker(res.data.user.email ?? '');

      const { data } = await this.supabase
        .from('contacts')
        .select('name')
        .eq('email', res.data.user.email)
        .single();

      this.userName.set(data?.name ?? '');
    }

    return { error: res.error, userName: this.userName() };
  }

  /**
   * Signs out the current user and clears the userName signal.
   */
  signOut() {
    this.userName.set('');
    return this.supabase.auth.signOut();
  }

  /**
   * Restores the userName signal from the current session's email.
   * Should be called on app init when a session already exists (e.g. after page refresh).
   */
  async restoreUserName() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session?.user?.email) return;

    await this.ensureCurrentUserContactMarker(session.user.email);

    const { data } = await this.supabase
      .from('contacts')
      .select('name')
      .eq('email', session.user.email)
      .single();

    this.userName.set(data?.name ?? '');
  }

  /**
   * Retrieves the current Supabase auth session.
   * @returns A promise resolving to the current session data.
   */
  getSession() {
    return this.supabase.auth.getSession();
  }

  /**
   * Registers a callback that fires whenever the auth state changes
   * (e.g. sign-in, sign-out, token refresh).
   * @param callback - Handler receiving the auth event and session.
   * @returns A subscription that can be unsubscribed from.
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Ensures that the current user's contact keeps an internal user marker in phone.
   * This keeps deletion protection stable even if the visible phone value is edited.
   * @param email Current authenticated user email.
   * @returns Promise that resolves after marker migration attempt.
   */
  private async ensureCurrentUserContactMarker(email: string) {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      return;
    }

    const { data: contact, error } = await this.supabase
      .from('contacts')
      .select('id, phone')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error || !contact) {
      return;
    }

    if (isUserContactPhone(contact.phone)) {
      return;
    }

    const visiblePhone = decodeUserContactPhone(contact.phone);
    await this.supabase
      .from('contacts')
      .update({ phone: encodeUserContactPhone(visiblePhone) })
      .eq('id', contact.id);
  }
}
