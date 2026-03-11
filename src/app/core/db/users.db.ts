import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class UsersDb {

  users = signal<User[]>([]);

  /**
   * Creates the users database service.
   * @param supa Shared Supabase service instance.
   */
  constructor(private supa: SupabaseService) { }

  /**
   * Loads all users from the Supabase `users` table into local state.
   * @returns Promise that resolves when loading is completed.
   */
  async getUsers() {
    const { data: users, error } = await this.supa.client
      .from('users')
      .select('*');

    if (error) {
      console.error('[Supabase] Error loading users:', error.message);
      return;
    }

    if (!users) return;
    this.users.set(users || []);
  }

  /**
   * Inserts a new user row into the Supabase `users` table.
   * @param user User payload without ID.
   * @returns Promise that resolves when insert request finishes.
   */
  async setUser(user: Omit<User, 'id'>) {
    const { data, error } = await this.supa.client
      .from('users')
      .insert([{ ...user }])
      .select();

    if (error) {
      console.error('[Supabase] Error adding user:', error.message);
      return;
    }
  }

  /**
   * Updates an existing user row by ID.
   * @param id User ID to update.
   * @param update Partial user payload to persist.
   * @returns Promise that resolves when update request finishes.
   */
  async updateUser(id: number, update: Partial<User>) {
    const { data, error } = await this.supa.client
      .from('users')
      .update(update)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating user:', error.message);
      return;
    }
  }

  /**
   * Deletes a user row by ID.
   * @param id User ID to delete.
   * @returns Promise that resolves when delete request finishes.
   */
  async deleteUser(id: number) {
    const { error } = await this.supa.client
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting user:', error.message);
      return;
    }
  }
}
