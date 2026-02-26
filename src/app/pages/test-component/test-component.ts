import { CommonModule } from '@angular/common';
import { inject, signal } from '@angular/core';
import { ContactAddFormComponent } from './../../components/contact-add-form/contact-add-form';
import { Component } from '@angular/core';
import { Button } from '../../shared/ui/button/button';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { ContactPicker } from '../../shared/ui/forms/contact-picker/contact-picker';
import { ContactsDb } from '../../core/db/contacts.db';

/**
 * A testing or demonstration component used to orchestrate UI elements.
 * It manages the visibility of the contact addition flow and integrates
 * shared UI components like buttons and input fields.
 * !!! NOTE: will be deleted after development !!!
 */
@Component({
  selector: 'app-test-component',
  imports: [ContactAddFormComponent, Button, InputFieldComponent, CommonModule, ContactPicker],
  templateUrl: './test-component.html',
  styleUrl: './test-component.scss',
})
export class TestComponent {
  contactsDb = inject(ContactsDb);
  selectedContactIds = signal<number[]>([]);

  async ngOnInit() {
    await this.contactsDb.getContacts();
  }

  onContactsSelected(ids: number[]) {
    this.selectedContactIds.set(ids);
  }

  /** * Controls the visibility state of the contact creation modal.
   * @default false
   */
  isContactModalOpen = false;

  /**
   * Sets the modal state to visible.
   * Typically triggered by a primary action button.
   */
  openModal() {
    this.isContactModalOpen = true;
  }

  /**
   * Sets the modal state to hidden.
   * Typically triggered by the modal's backdrop or a cancel action.
   */
  closeModal() {
    this.isContactModalOpen = false;
  }
}
