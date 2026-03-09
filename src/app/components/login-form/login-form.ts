import { Component, EventEmitter, Output, inject, ChangeDetectorRef } from '@angular/core';
import { ContactsDb, Contact } from './../../core/db/contacts.db';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { FormsModule } from '@angular/forms';
import { isValidEmail, isValidPassword } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-login-form',
  imports: [ModalWrapper, FormsModule, InputFieldComponent, Button],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  @Output() added = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSaving = false;
  errorMessage = '';

  form = {
    email: '',
    password: '',
  };

  errors = {
    email: '',
    password: '',
  };

  dirty = {
    email: false,
    password: false,
  };

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
      case 'email':
        this.errors.email = isValidEmail(value)
          ? ''
          : 'Please enter a valid email address with maximum 35 characters.';
        break;

      case 'password':
        this.errors.password = isValidPassword(value)
          ? ''
          : 'Password must be at least 8 characters long.';
        break;
    }
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
  }

  /**
   * Marks all form fields as dirty to ensure full validation before submission.
   */
  private markAllDirty() {
    this.markDirty('email');
    this.markDirty('password');
  }

  /**
   * Checks whether all form fields contain valid values and no validation errors remain.
   * @returns {boolean} True if the form is valid, otherwise false.
   */
  isFormValid() {
    return (
      this.form.email.trim() !== '' &&
      this.form.password.trim() !== '' &&
      !this.errors.email &&
      !this.errors.password
    );
  }

  /**
   * Emits the `closed` event to notify the parent component
   * that the form should be closed without saving.
   */
  onCancel() {
    this.closed.emit();
  }
}
