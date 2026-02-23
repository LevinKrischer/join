import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactsDb } from '../../core/db/contacts.db';
import { Contact, ContactWithInitials, GroupedContacts } from './../../core/db/contacts.db';
import { ContactDetails } from './contact-details/contact-details';
import { ContactList } from './contact-list/contact-list';
import { ContactHeader } from './contact-header/contact-header';
import { UserFeedbackComponent } from "../../shared/ui/user-feedback/user-feedback";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ContactDetails, ContactList, ContactHeader, UserFeedbackComponent],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts implements OnInit {
  @ViewChild('feedback') feedback!: UserFeedbackComponent;

  groupedContacts = signal<GroupedContacts[]>([]);
  searchTerm = signal('');
  selected: ContactWithInitials | null = null;
  isMobileDetailOpen = false;

  constructor(private contactsDb: ContactsDb) { }

  async ngOnInit() {
    await this.contactsDb.getContacts();
    this.groupedContacts.set(this.sortAndGroup(this.contactsDb.contacts()));
  }

  filteredContacts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (term.length < 3) return this.groupedContacts();
    return this.groupedContacts()
      .map((group) => ({
        ...group,
        contacts: group.contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.phone.includes(term),
        ),
      }))
      .filter((group) => group.contacts.length > 0);
  });

  private getInitials(name: string): string {
    const parts = name.split(' ');
    const [first, last] = [parts[0], parts.at(-1)];
    return (first?.[0] ?? '') + (last?.[0] ?? '');
  }

  private sortAndGroup(contacts: Contact[]): GroupedContacts[] {
    const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
    const groups: GroupedContacts[] = [];

    for (const contact of sorted) {
      const letter = contact.name[0].toUpperCase();
      const initials = this.getInitials(contact.name);
      let group = groups.find((g) => g.letter === letter);
      if (!group) {
        group = { letter, contacts: [] };
        groups.push(group);
      }
      group.contacts.push({ ...contact, initials });
    }

    return groups;
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  selectContact(c: ContactWithInitials) {
    this.selected = c;
    this.isMobileDetailOpen = true;
  }

  backToList() {
    this.isMobileDetailOpen = false;
    this.selected = null;
  }

  editSelected() {
    if (!this.selected) return;
    this.feedback.show(`Contact '${this.selected.name}' has been updated!`);
  }

  async onContactAdded() {
    await this.contactsDb.getContacts();
    this.groupedContacts.set(this.sortAndGroup(this.contactsDb.contacts()));

    this.feedback.show(`Contact has been created!`);
  }

  async deleteSelected() {
    if (!this.selected) return;

    const deletedName = this.selected.name;

    await this.contactsDb.deleteContact(this.selected.id);

    const remaining = this.contactsDb.contacts().filter(c => c.id !== this.selected!.id);
    this.groupedContacts.set(this.sortAndGroup(remaining));

    this.selected = null;
    this.isMobileDetailOpen = false;

    this.feedback.show(`Contact '${deletedName}' has been deleted!`);
  }
}
