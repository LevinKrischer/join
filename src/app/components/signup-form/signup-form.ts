import { Component, input, output, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { isValidEmail, isValidPassword, isValidName } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-signup-form',
  imports: [FormsModule, InputFieldComponent, Button, RouterLink],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  submitted = output<{ name: string; email: string; password: string }>();

  errorMessage = input('');
  isSubmitting = input(false);
  passwordVisible = signal(false);
  confirmPasswordVisible = signal(false);
  passwordToggleReady = signal(false);
  confirmPasswordToggleReady = signal(false);

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

    if (field === 'password' && !this.form.password.trim()) {
      this.passwordVisible.set(false);
      this.passwordToggleReady.set(false);
    }

    if (field === 'confirmPassword' && !this.form.confirmPassword.trim()) {
      this.confirmPasswordVisible.set(false);
      this.confirmPasswordToggleReady.set(false);
    }
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
    if (this.isSubmitting()) return;

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

  activatePasswordToggle(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.passwordToggleReady.set(true);
      return;
    }

    this.confirmPasswordToggleReady.set(true);
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      if (!this.passwordToggleReady()) return;
      this.passwordVisible.update((current) => !current);
      return;
    }

    if (!this.confirmPasswordToggleReady()) return;
    this.confirmPasswordVisible.update((current) => !current);
  }

  getPasswordFieldType(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      return this.passwordVisible() ? 'text' : 'password';
    }

    return this.confirmPasswordVisible() ? 'text' : 'password';
  }

  getPasswordFieldIcon(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      if (this.passwordVisible()) {
        return 'assets/icons/form-visibility-off-24px.svg';
      }

      if (this.passwordToggleReady()) {
        return 'assets/icons/form-visibility-on-24px.svg';
      }

      return 'assets/icons/form-lock-24px.svg';
    }

    if (this.confirmPasswordVisible()) {
      return 'assets/icons/form-visibility-off-24px.svg';
    }

    if (this.confirmPasswordToggleReady()) {
      return 'assets/icons/form-visibility-on-24px.svg';
    }

    return 'assets/icons/form-lock-24px.svg';
  }

  getPasswordIconAlt(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      if (this.passwordVisible()) {
        return 'Hide password';
      }

      if (this.passwordToggleReady()) {
        return 'Show password';
      }

      return 'Password locked';
    }

    if (this.confirmPasswordVisible()) {
      return 'Hide confirm password';
    }

    if (this.confirmPasswordToggleReady()) {
      return 'Show confirm password';
    }

    return 'Confirm password locked';
  }

  isPasswordToggleVisible(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      return this.passwordToggleReady();
    }

    return this.confirmPasswordToggleReady();
  }
}
