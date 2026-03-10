import { Injectable } from '@angular/core';
import { AuthChangeEvent, Session, createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

/**
 * Centralized service responsible for creating and providing a single Supabase client instance.
 * This ensures that the entire application communicates with Supabase through one consistent,
 * preconfigured client, avoiding duplicate connections and simplifying database, auth,
 * and storage interactions across all services and components.
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  /**
   * Returns the initialized Supabase client.
   * Used by other services to perform database queries, authentication,
   * storage operations, and realtime subscriptions.
   */
  get client() {
    return this.supabase;
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

}
