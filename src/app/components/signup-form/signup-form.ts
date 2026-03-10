import { Component, input, output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { isValidEmail, isValidPassword, isValidName } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';
import { RouterLink } from "@angular/router";
import { BackButton } from "../../shared/ui/forms/back-button/back-button";

@Component({
  selector: 'app-signup-form',
  imports: [FormsModule, InputFieldComponent, Button, RouterLink, BackButton],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  submitted = output<{ name: string; email: string; password: string }>();

  errorMessage = input('');

  form = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedPrivacy: false,
  };

  errors = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  dirty = {
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  };

  /**
   * Marks a specific form field as dirty and triggers validation for it.
   * Dirty fields show validation errors immediately when modified.
   * @param {string} field - The field to mark as dirty.
   */
  markDirty(field: 'name' | 'email' | 'password' | 'confirmPassword') {
    this.dirty[field] = true;
    this.validateField(field);
  }

  /**
   * Performs validation on a field only if it has already been marked as dirty.
   * Used for live validation while typing.
   * @param {string} field - The field to validate.
   */
  liveValidate(field: 'name' | 'email' | 'password' | 'confirmPassword') {
    if (this.dirty[field]) {
      this.validateField(field);
    }
    // Re-validate confirmPassword when password changes
    if (field === 'password' && this.dirty.confirmPassword) {
      this.validateField('confirmPassword');
    }
  }

  /**
   * Validates a single form field and updates the corresponding error message.
   * Delegates validation logic to shared utility functions.
   * @param {string} field - The field to validate.
   */
  validateField(field: 'name' | 'email' | 'password' | 'confirmPassword') {
    const value = this.form[field];

    switch (field) {
      case 'name':
        this.errors.name = isValidName(value)
          ? ''
          : 'Please enter first and last name with maximum 30 letters';
        break;

      case 'email':
        this.errors.email = isValidEmail(value)
          ? ''
          : 'Please enter a valid email address with maximum 35 characters';
        break;

      case 'password':
        this.errors.password = isValidPassword(value)
          ? ''
          : 'Password must be at least 8 characters long';
        break;

      case 'confirmPassword':
        this.errors.confirmPassword =
          value === this.form.password
            ? ''
            : 'Passwords do not match';
        break;
    }
  }

  /**
   * Validates the form and emits the submitted event with email and password.
   */
  submit() {
    this.markAllDirty();
    if (!this.isFormValid()) return;

    this.submitted.emit({ name: this.form.name, email: this.form.email, password: this.form.password });
  }

  /**
   * Marks all form fields as dirty to ensure full validation before submission.
   */
  private markAllDirty() {
    this.markDirty('name');
    this.markDirty('email');
    this.markDirty('password');
    this.markDirty('confirmPassword');
  }

  isFormValid() {
    return (
      this.form.name.trim() !== '' &&
      this.form.email.trim() !== '' &&
      this.form.password.trim() !== '' &&
      this.form.confirmPassword.trim() !== '' &&
      this.form.acceptedPrivacy &&
      !this.errors.name &&
      !this.errors.email &&
      !this.errors.password &&
      !this.errors.confirmPassword
    );
  }
}
