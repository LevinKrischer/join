import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GroupedContacts, ContactWithInitials } from '../../../core/db/contacts.db';
import { ContactAddFormComponent } from '../../../components/contact-add-form/contact-add-form';
import { Button } from '../../../shared/ui/button/button';
import { InputFieldComponent } from '../../../shared/ui/input-field/input-field';

@Component({
  selector: 'app-contact-list',
  imports: [ContactAddFormComponent, CommonModule, Button, InputFieldComponent],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  @Input() groups: GroupedContacts[] = [];
  @Input() selectedId: number | null = null;
  @Output() search = new EventEmitter<Event>();
  @Output() select = new EventEmitter<ContactWithInitials>();
  @Output() added = new EventEmitter<void>();

  isContactModalOpen = false;
  isMobileSearchOpen = false;
  searchError: string | null = null;

  /**
   * Emits the search event and displays an error message if no contacts match after 3+ characters.
   * @param event - The native input event from the search field.
   */
  onSearchInput(event: Event) {
    this.search.emit(event);
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    if (term.length < 3) {
      this.searchError = null;
      return;
    }
    const hasResults = this.groups.some((g) =>
      g.contacts.some(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term),
      ),
    );
    this.searchError = hasResults ? null : 'No contacts found';
  }

  /**
   * Opens the contact add modal.
   */
  openModal() {
    this.isContactModalOpen = true;
  }

  /**
   * Closes the contact add modal.
   */
  closeModal() {
    this.isContactModalOpen = false;
  }

  /**
   * Emits the added event and closes the modal after a contact was created.
   */
  onAdded() {
    this.added.emit();
    this.closeModal();
  }
}
