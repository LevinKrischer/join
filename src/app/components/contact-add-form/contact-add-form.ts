import { CONTACT_COLORS } from './../../core/constants/colors';
import { ContactsDb, Contact } from './../../core/db/contacts.db';
import { Component, EventEmitter, Output, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isValidName, isValidEmail, isValidPhone } from '../../core/utils/validation';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { InputFieldComponent } from '../../shared/ui/input-field/input-field';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-contact-add-form',
  standalone: true,
  imports: [FormsModule, ModalWrapper, InputFieldComponent, Button],
  templateUrl: './contact-add-form.html',
  styleUrls: ['./contact-add-form.scss'],
})
export class ContactAddFormComponent {
  db = inject(ContactsDb);
  cdr = inject(ChangeDetectorRef);

  @Output() added = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSaving = false;
  errorMessage = '';

  form: Omit<Contact, 'id' | 'color'> = {
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
 * Selects a random color from the predefined CONTACT_COLORS list.
 * Used to assign a visual identifier to newly created contacts.
 * @returns {string} A randomly selected color value.
 */
  private getRandomColor() {
    const index = Math.floor(Math.random() * CONTACT_COLORS.length);
    return CONTACT_COLORS[index];
  }

  /**
   * Marks a specific form field as dirty and triggers validation for it.
   * Dirty fields show validation errors immediately when modified.
   * @param {keyof typeof this.dirty} field - The field to mark as dirty.
   */
  markDirty(field: keyof typeof this.dirty) {
    this.dirty[field] = true;
    this.validateField(field);
  }

  /**
   * Performs validation on a field only if it has already been marked as dirty.
   * Used for live validation while typing.
   * @param {keyof typeof this.dirty} field - The field to validate.
   */
  liveValidate(field: keyof typeof this.dirty) {
    if (this.dirty[field]) {
      this.validateField(field);
    }
  }

  /**
   * Validates a single form field and updates the corresponding error message.
   * Delegates validation logic to shared utility functions.
   * @param {keyof typeof this.form} field - The field to validate.
   */
  validateField(field: keyof typeof this.form) {
    const value = this.form[field];

    switch (field) {
      case 'name':
        this.errors.name = isValidName(value) ? '' : 'Name must contain at least first and last name, using letters only (max 30 characters).';
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
   * Checks whether all form fields contain valid values and no validation errors remain.
   * @returns {boolean} True if the form is valid, otherwise false.
   */
  isFormValid() {
    return (
      this.form.name.trim() !== '' &&
      this.form.email.trim() !== '' &&
      this.form.phone.trim() !== '' &&
      !this.errors.name &&
      !this.errors.email &&
      !this.errors.phone
    );
  }

  /**
   * Handles the full submission flow:
   * - Marks all fields as dirty
   * - Validates the form
   * - Saves the contact to the database
   * - Emits the `added` event on success
   * - Handles and displays errors
   * - Manages loading state
   * @returns {Promise<void>}
   */
  async submit() {
    this.markAllDirty();
    if (!this.isFormValid()) return;

    this.startSaving();

    try {
      await this.saveContact();
      this.added.emit();
    } catch (err) {
      this.handleSaveError(err);
    } finally {
      this.finishSaving();
    }
  }

  /**
   * Marks all form fields as dirty to ensure full validation before submission.
   */
  private markAllDirty() {
    this.markDirty('name');
    this.markDirty('email');
    this.markDirty('phone');
  }

  /**
   * Initializes the saving state by enabling the loading indicator
   * and clearing any previous error messages.
   */
  private startSaving() {
    this.isSaving = true;
    this.errorMessage = '';
  }

  /**
   * Persists the contact data to the database.
   * Automatically assigns a random color to the new contact.
   * @returns {Promise<void>} A promise resolving when the contact is saved.
   */
  private async saveContact() {
    return this.db.setContact({
      ...this.form,
      color: this.getRandomColor(),
    });
  }

  /**
   * Handles errors that occur during the save operation.
   * Logs the error, displays a user-friendly message,
   * and triggers change detection to update the UI.
   * @param {unknown} err - The error thrown during saving.
   */
  private handleSaveError(err: unknown) {
    console.error('Saving failed:', err);
    this.errorMessage =
      'Saving failed. Please check your connection or try again later.';
    this.cdr.detectChanges();
  }

  /**
   * Finalizes the saving process by disabling the loading indicator.
   */
  private finishSaving() {
    this.isSaving = false;
  }

  /**
   * Emits the `closed` event to notify the parent component
   * that the form should be closed without saving.
   */
  onCancel() {
    this.closed.emit();
  }
}
