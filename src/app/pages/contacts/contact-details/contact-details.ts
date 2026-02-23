import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
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
  isMobileActionsOpen = false;

  constructor(private elRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isMobileActionsOpen && !this.elRef.nativeElement.querySelector('.mobile-actions-fab')?.contains(event.target)) {
      this.isMobileActionsOpen = false;
    }
  }

  toggleMobileActions() {
    this.isMobileActionsOpen = !this.isMobileActionsOpen;
  }

  closeMobileActions() {
    this.isMobileActionsOpen = false;
  }


  selectedContact: ContactWithInitials | null = null;

  openModal() {
    this.isContactModalOpen = true;
  }

  closeModal() {
    this.isContactModalOpen = false;
  }

  openEdit(contact: ContactWithInitials) {
    this.selectedContact = contact;
    this.isContactModalOpen = true;
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

