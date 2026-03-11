import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  color: string;
}

export interface ContactWithInitials extends Contact {
  initials: string;
}

export interface GroupedContacts {
  letter: string;
  contacts: ContactWithInitials[];
}


@Injectable({ providedIn: 'root' })
export class ContactsDb {

  contacts = signal<Contact[]>([]);
  groupedContacts = signal<GroupedContacts[]>([]);
  channels: RealtimeChannel | null = null;

  /**
   * Creates the contacts database service.
   * @param supa Shared Supabase service instance.
   */
  constructor(private supa: SupabaseService) { }

  /**
   * Loads all contacts from the Supabase `contacts` table.
   * Updates the `contacts` signal and subscribes to realtime changes.
   * Logs an error if the request fails.
   * @returns Promise that resolves when loading flow is completed.
   */
  async getContacts() {
    const { contacts, error } = await this.loadContactsFromDatabase();
    if (this.hasLoadContactsError(error)) {
      return;
    }

    this.applyContactsToState(contacts);
    this.subscripeToContactChanges();
  }

  /**
   * Loads contacts from Supabase.
   * @returns Promise with loaded contacts and possible error.
   */
  private async loadContactsFromDatabase() {
    const { data: contacts, error } = await this.supa.client.from('contacts').select('*');
    return { contacts, error };
  }

  /**
   * Handles load errors and reports them to the console.
   * @param error Potential query error from Supabase.
   * @returns True when an error occurred and flow should stop.
   */
  private hasLoadContactsError(error: { message: string } | null): boolean {
    if (!error) {
      return false;
    }

    console.error('[Supabase] Error loading contacts:', error.message);
    return true;
  }

  /**
   * Updates contacts signal and excludes guest account from list.
   * @param contacts Contacts loaded from database.
   * @returns Nothing.
   */
  private applyContactsToState(contacts: Contact[] | null) {
    if (!contacts) {
      return;
    }

    this.contacts.set(contacts.filter((c) => c.email !== 'guest@join.de'));
  }

  /**
   * Inserts a new contact into the Supabase `contacts` table.
    * @param contact Contact data without the `id` field.
   * @returns The inserted contact data returned by Supabase.
   * @throws If the insert operation fails.
   */
  async setContact(contact: Omit<Contact, 'id'>) {
    const { data, error } = await this.supa.client
      .from('contacts')
      .insert([{ ...contact }])
      .select();

    if (error) {
      console.error('[Supabase] Error adding contact:', error.message);
      throw error;
    }

    return data;
  }

  /**
   * Updates an existing contact in the Supabase `contacts` table.
    * @param id The ID of the contact to update.
    * @param update Partial contact data to update.
   * @returns The updated contact data returned by Supabase.
   * @throws If the update operation fails.
   */
  async updateContact(id: number, update: Partial<Contact>) {
    const { data, error } = await this.supa.client
      .from('contacts')
      .update(update)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating contact:', error.message);
      throw error;
    }

    return data;
  }

  /**
   * Deletes a contact from the Supabase `contacts` table.
   * First removes all task-contact associations to avoid foreign key constraint violations.
   * @param id The ID of the contact to delete.
   * @returns Promise that resolves when delete flow is completed.
   * @throws If the delete operation fails.
   */
  async deleteContact(id: number) {
    await this.deleteTaskContactAssignments(id);
    await this.deleteContactById(id);
  }

  /**
   * Deletes task-contact assignments for a contact.
   * @param id Contact ID whose assignments should be removed.
   * @returns Promise that resolves when assignment rows are deleted.
   * @throws If the delete operation fails.
   */
  private async deleteTaskContactAssignments(id: number) {
    const { error: assignmentError } = await this.supa.client.from('tasks_contacts').delete().eq('contact_id', id);
    if (assignmentError) {
      console.error('[Supabase] Error deleting contact associations:', assignmentError.message);
      throw assignmentError;
    }
  }

  /**
   * Deletes the contact row itself.
   * @param id Contact ID to delete.
   * @returns Promise that resolves when contact row is deleted.
   * @throws If the delete operation fails.
   */
  private async deleteContactById(id: number) {
    const { error: contactError } = await this.supa.client.from('contacts').delete().eq('id', id);
    if (contactError) {
      console.error('[Supabase] Error deleting contact:', contactError.message);
      throw contactError;
    }
  }

  /**
   * Angular lifecycle hook.
   * Cleans up the realtime subscription when the service is destroyed.
   * @returns Nothing.
   */
  ngOnDestroy() {
    this.unSubscripeFromContactChanges();
  }

  /**
   * Subscribes to realtime changes on the Supabase `contacts` table.
   * Whenever a change occurs, contacts are reloaded.
   * @returns Nothing.
   */
  subscripeToContactChanges() {
    this.channels = this.supa.client.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, async () => {
        await this.getContacts();
      })
      .subscribe();
  }

  /**
   * Unsubscribes from the realtime channel if it exists.
   * Prevents memory leaks and duplicate subscriptions.
   * @returns Nothing.
   */
  unSubscripeFromContactChanges() {
    if (this.channels) {
      this.supa.client.removeChannel(this.channels);
    }
  }
}
