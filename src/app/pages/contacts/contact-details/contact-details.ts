import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { ContactWithInitials } from '../../../core/db/contacts.db';
import { ContactEditFormComponent } from '../../../components/contact-edit-form/contact-edit-form';
import { TruncatePipe } from '../../../services/truncate.pipe';

@Component({
  selector: 'app-contact-details',
  imports: [ContactEditFormComponent, TruncatePipe],
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

  constructor(private elRef: ElementRef) { }

  /**
   * Closes the mobile actions menu when the user clicks outside of it.
   *
   * @param event - The global document click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isMobileActionsOpen && !this.elRef.nativeElement.querySelector('.mobile-actions-fab')?.contains(event.target)) {
      this.isMobileActionsOpen = false;
    }
  }

  /** Toggles visibility of the mobile actions menu. */
  toggleMobileActions() {
    this.isMobileActionsOpen = !this.isMobileActionsOpen;
  }

  /** Closes the mobile actions menu. */
  closeMobileActions() {
    this.isMobileActionsOpen = false;
  }


  selectedContact: ContactWithInitials | null = null;

  /** Opens the contact edit modal. */
  openModal() {
    this.isContactModalOpen = true;
  }

  /** Closes the contact edit modal. */
  closeModal() {
    this.isContactModalOpen = false;
  }

  /**
   * Opens the edit modal pre-filled with the given contact's data.
   *
   * @param contact - The contact to edit.
   */
  openEdit(contact: ContactWithInitials) {
    this.selectedContact = contact;
    this.isContactModalOpen = true;
  }

  /** Emits the updated contact and closes the modal after a successful edit. */
  onEditSaved() {
    this.edit.emit(this.contact!);
    this.closeModal();
  }

  /** Emits a remove event for the current contact and closes the modal. */
  onEditDeleted() {
    if (this.contact) {
      this.remove.emit(this.contact);
    }
    this.closeModal();
  }
}

