import { Component, EventEmitter, Input, Output, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactsDb, Contact, ContactWithInitials } from './../../core/db/contacts.db';
import { isValidName, isValidEmail, isValidPhone } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/input-field/input-field';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-contact-edit-form',
  standalone: true,
  imports: [FormsModule, InputFieldComponent, ModalWrapper, Button],
  templateUrl: './contact-edit-form.html',
  styleUrls: ['./contact-edit-form.scss'],
})
export class ContactEditFormComponent {
  db = inject(ContactsDb);
  cdr = inject(ChangeDetectorRef);

  @Input() contact: ContactWithInitials | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSaving = false;
  isDeleting = false;
  errorMessage = '';

  form: Partial<Contact> = {
    name: '',
    email: '',
    phone: '',
  };

  errors = {
    name: '',
    email: '',
    phone: '',
  };

  dirty = {
    name: false,
    email: false,
    phone: false,
  };

  /**
   * Updates the form whenever the input `contact` changes.
   * Ensures the edit form always reflects the selected contact.
   */
  ngOnChanges() {
    if (!this.contact) return;

    this.form = {
      name: this.contact.name,
      email: this.contact.email,
      phone: this.contact.phone,
    };
  }

  /**
   * Marks a field as dirty and triggers validation.
   * @param field - The field to mark as dirty.
   */
  markDirty(field: keyof typeof this.dirty) {
    this.dirty[field] = true;
    this.validateField(field);
  }

  /**
   * Performs validation only if the field is already dirty.
   * @param field - The field to validate.
   */
  liveValidate(field: keyof typeof this.dirty) {
    if (this.dirty[field]) {
      this.validateField(field);
    }
  }

  /**
   * Validates a single field and updates its error message.
   * @param field - The field to validate.
   */
  validateField(field: keyof typeof this.form) {
    if (!this.contact) return;

    const rawValue = this.form[field];
    const value = String(rawValue ?? '');

    switch (field) {
      case 'name':
        this.errors.name = isValidName(value) ? '' : 'Name may only contain letters.';
        break;

      case 'email':
        this.errors.email = isValidEmail(value) ? '' : 'Please enter a valid email address.';
        break;

      case 'phone':
        this.errors.phone = isValidPhone(value)
          ? ''
          : 'Please enter at least 10 digits using numbers only (a leading + is allowed).';
        break;
    }
  }

  /**
   * Checks whether all fields contain valid values.
   * @returns True if the form is valid.
   */
  isFormValid() {
    return (
      String(this.form.name ?? '').trim() !== '' &&
      String(this.form.email ?? '').trim() !== '' &&
      String(this.form.phone ?? '').trim() !== '' &&
      !this.errors.name &&
      !this.errors.email &&
      !this.errors.phone
    );
  }

  /**
   * Saves the updated contact.
   * Handles validation, saving, error states, and event emission.
   */
  async save() {
    this.markAllDirty();
    if (!this.isFormValid() || !this.contact) return;

    this.startSaving();

    try {
      await this.updateContact();
      this.saved.emit();
    } catch (err) {
      this.handleSaveError(err);
    } finally {
      this.finishSaving();
    }
  }

  /**
   * Deletes the current contact.
   * Prevents duplicate actions and handles errors.
   */
  async delete() {
    if (!this.contact || this.isDeleting) return;

    this.startDeleting();

    try {
      await this.db.deleteContact(this.contact.id);
      this.deleted.emit();
    } catch (err) {
      this.handleDeleteError(err);
    } finally {
      this.finishDeleting();
    }
  }

  /**
   * Emits the `closed` event to close the form without saving.
   */
  onCancel() {
    this.closed.emit();
  }

  // ---------------------------------------------------------
  // Unterfunktionen (Refactoring)
  // ---------------------------------------------------------

  /**
   * Marks all fields as dirty to trigger full validation.
   */
  private markAllDirty() {
    this.markDirty('name');
    this.markDirty('email');
    this.markDirty('phone');
  }

  /**
   * Initializes the saving state.
   */
  private startSaving() {
    this.isSaving = true;
    this.errorMessage = '';
  }

  /**
   * Sends the updated contact data to the database.
   */
  private async updateContact() {
    return this.db.updateContact(this.contact!.id, {
      name: String(this.form.name),
      email: String(this.form.email),
      phone: String(this.form.phone),
    });
  }

  /**
   * Handles errors during saving.
   * @param err - The thrown error.
   */
  private handleSaveError(err: unknown) {
    console.error('Failed to update contact:', err);
    this.errorMessage = 'Saving failed. Please check your connection or try again later.';
    this.cdr.detectChanges();
  }

  /**
   * Finalizes the saving state.
   */
  private finishSaving() {
    this.isSaving = false;
  }

  /**
   * Initializes the deleting state.
   */
  private startDeleting() {
    this.isDeleting = true;
    this.errorMessage = '';
  }

  /**
   * Handles errors during deletion.
   * @param err - The thrown error.
   */
  private handleDeleteError(err: unknown) {
    console.error('Failed to delete contact:', err);
    this.errorMessage = 'Deleting failed. Please check your connection or try again later.';
    this.cdr.detectChanges();
  }

  /**
   * Finalizes the deleting state.
   */
  private finishDeleting() {
    this.isDeleting = false;
  }
}
