import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GroupedContacts, ContactWithInitials } from '../../../core/db/contacts.db';
import { ContactAddFormComponent } from '../../../components/contact-add-form/contact-add-form';
import { Button } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-contact-list',
  imports: [ContactAddFormComponent, CommonModule, Button],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList {
  @Input() groups: GroupedContacts[] = [];
  @Input() selectedId: number | null = null;
  @Output() select = new EventEmitter<ContactWithInitials>();
  @Output() added = new EventEmitter<void>();

  isContactModalOpen = false;

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
