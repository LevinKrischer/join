import { Injectable, signal } from '@angular/core';
import { SupabaseClientService } from './supabase.client';
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

  constructor(private supa: SupabaseClientService) { }

  async getContacts() {
    const { data: contacts, error } = await this.supa.supabase
      .from('contacts')
      .select('*');

    if (error) {
      console.error('[Supabase] Error loading contacts:', error.message);
      return;
    }

    if (!contacts) return;
    this.contacts.set(contacts || []);

    this.subscripeToContactChanges();
  }

  async setContact(contact: Omit<Contact, 'id'>) {
    const { data, error } = await this.supa.supabase
      .from('contacts')
      .insert([{ ...contact }])
      .select();

    if (error) {
      console.error('[Supabase] Error adding contact:', error.message);
      throw error;
    }

    return data;
  }


  async updateContact(id: number, update: Partial<Contact>) {
    const { data, error } = await this.supa.supabase
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


  async deleteContact(id: number) {
    const { error } = await this.supa.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting contact:', error.message);
      throw error;
    }
  }

  ngOnDestroy() {
    this.unSubscripeFromContactChanges();
  }

  subscripeToContactChanges() {
    this.channels = this.supa.supabase.channel('custom-all-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        async () => {
          await this.getContacts();
        }
      )
      .subscribe();
  }

  unSubscripeFromContactChanges() {
    if (this.channels) {
      this.supa.supabase.removeChannel(this.channels);
    }
  }
}
