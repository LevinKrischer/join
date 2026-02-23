import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContactWithInitials } from '../../../core/db/contacts.db';
import { ContactEditFormComponent } from '../../../components/contact-edit-form/contact-edit-form';

@Component({
  selector: 'app-contact-details',
  imports: [ContactEditFormComponent],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})

export class ContactDetails {
  @Input() contact: ContactWithInitials | null = null;
  @Output() edit = new EventEmitter<ContactWithInitials>();
  @Output() remove = new EventEmitter<ContactWithInitials>();
  @Output() back = new EventEmitter<void>();

  isContactModalOpen = false;

  // NEU: eigener State für den Kontakt, der editiert wird
  selectedContact: ContactWithInitials | null = null;

  openModal() {
    this.isContactModalOpen = true;
  }

  closeModal() {
    this.isContactModalOpen = false;
  }

  openEdit(contact: ContactWithInitials) {
    this.selectedContact = contact;   // Kontakt setzen
    this.isContactModalOpen = true;   // Modal öffnen
  }

  onEditSaved() {
    this.edit.emit(this.contact!);
    this.closeModal();
  }

  onEditDeleted() {
    if (this.contact) {
      this.remove.emit(this.contact);
    }
    this.closeModal();
  }
}

