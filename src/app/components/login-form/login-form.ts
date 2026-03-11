import { Component, input, output, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { isValidEmail, isValidPassword } from '../../core/utils/validation';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-login-form',
  imports: [FormsModule, InputFieldComponent, Button],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  submitted = output<{ email: string; password: string }>();

  errorMessage = input('');
  passwordVisible = signal(false);
  passwordToggleReady = signal(false);

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

    if (field === 'password' && !this.form.password.trim()) {
      this.passwordVisible.set(false);
      this.passwordToggleReady.set(false);
    }
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
          : 'Please enter a valid email address with maximum 35 characters';
        break;

      case 'password':
        this.errors.password = isValidPassword(value)
          ? ''
          : 'Password must be at least 8 characters long';
        break;
    }
  }

  /**
   * Validates the form and emits the submitted event with email and password.
   */
  submit() {
    this.markAllDirty();
    if (!this.isFormValid()) return;

    this.submitted.emit({ email: this.form.email, password: this.form.password });
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
   * Logs in with guest credentials bypassing manual input and validation.
   */
  guestLogin() {
    this.form.email = environment.guestEmail;
    this.form.password = environment.guestPassword;
    this.submitted.emit({ email: this.form.email, password: this.form.password });
  }

  /**
   * Toggles password field between visible text and hidden input.
   */
  togglePasswordVisibility() {
    if (!this.passwordToggleReady()) return;
    this.passwordVisible.update((current) => !current);
  }

  /**
   * Enables the password visibility toggle once the user starts typing.
   */
  activatePasswordToggle() {
    this.passwordToggleReady.set(true);
  }

  /**
   * Returns the input type for the password field based on visibility state.
   * @returns The current input type.
   */
  getPasswordFieldType() {
    return this.passwordVisible() ? 'text' : 'password';
  }

  /**
   * Returns the icon path for the password field based on visibility and readiness state.
   * @returns The asset path to the appropriate icon.
   */
  getPasswordFieldIcon() {
    if (this.passwordVisible()) {
      return 'assets/icons/form-visibility-off-24px.svg';
    }

    if (this.passwordToggleReady()) {
      return 'assets/icons/form-visibility-on-24px.svg';
    }

    return 'assets/icons/form-lock-24px.svg';
  }

  /**
   * Returns the alt text for the password icon based on visibility and readiness state.
   * @returns The descriptive alt text string.
   */
  getPasswordIconAlt() {
    if (this.passwordVisible()) {
      return 'Hide password';
    }

    if (this.passwordToggleReady()) {
      return 'Show password';
    }

    return 'Password locked';
  }

  /**
   * Indicates whether the password visibility toggle button should be shown.
   * @returns True if the toggle is ready to be displayed.
   */
  isPasswordToggleVisible() {
    return this.passwordToggleReady();
  }
}
