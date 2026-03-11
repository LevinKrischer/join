import { Component, inject, signal, viewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SignupForm } from '../../components/signup-form/signup-form';
import { SupabaseService } from '../../services/supabase';
import { ContactsDb } from '../../core/db/contacts.db';
import { CONTACT_COLORS } from '../../core/constants/colors';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';
import { BackButton } from '../../shared/ui/forms/back-button/back-button';

@Component({
  selector: 'app-signup',
  imports: [SignupForm, UserFeedbackComponent, BackButton, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  private supabaseService = inject(SupabaseService);
  private contactsDb = inject(ContactsDb);
  private router = inject(Router);
  private feedback = viewChild.required<UserFeedbackComponent>('feedback');

  errorMessage = signal('');
  isSubmitting = signal(false);

  /**
   * Handles sign-up form submission and orchestrates the registration flow.
   * @param credentials Submitted sign-up form credentials.
   * @returns Promise that resolves when the flow is completed.
   */
  async onSubmitted(credentials: { name: string; email: string; password: string }) {
    if (this.isSubmitting()) return;
    this.beginSubmission();
    await this.runSignupFlow(credentials);
    this.isSubmitting.set(false);
  }

  /**
   * Executes the full sign-up flow with centralized error handling.
   * @param credentials Submitted sign-up form credentials.
   * @returns Promise that resolves when the flow handling is done.
   */
  private async runSignupFlow(credentials: { name: string; email: string; password: string }) {
    try {
      const signUpSucceeded = await this.trySignUp(credentials);
      if (!signUpSucceeded) return;
      await this.createContactFromCredentials(credentials);
      await this.completeSuccessfulSignup();
    } catch {
      this.setGenericSignUpError();
    }
  }

  /**
   * Prepares local UI state for a fresh sign-up attempt.
   * @returns Nothing.
   */
  private beginSubmission() {
    this.errorMessage.set('');
    this.isSubmitting.set(true);
  }

  /**
   * Executes sign-up against Supabase and validates returned user data.
   * @param credentials Submitted sign-up form credentials.
   * @returns Promise with true if sign-up succeeded, otherwise false.
   */
  private async trySignUp(credentials: { name: string; email: string; password: string }): Promise<boolean> {
    const { data, error } = await this.supabaseService.signUp(credentials.email, credentials.password);
    if (error) {
      this.errorMessage.set(error.message);
      return false;
    }
    if (!data.user) {
      this.setGenericSignUpError();
      return false;
    }
    return true;
  }

  /**
   * Creates a contact entry for a newly registered user.
   * @param credentials Submitted sign-up form credentials.
   * @returns Promise that resolves after persisting the contact.
   */
  private async createContactFromCredentials(credentials: { name: string; email: string; password: string }) {
    await this.contactsDb.setContact({
      name: credentials.name,
      email: credentials.email,
      phone: '',
      color: this.getRandomColor(),
    });
  }

  /**
   * Finalizes successful sign-up by logging out, showing feedback, and navigating.
   * @returns Promise that resolves after completion steps are triggered.
   */
  private async completeSuccessfulSignup() {
    await this.supabaseService.signOut();
    this.feedback().show('You signed up successfully!');
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }

  /**
   * Sets the generic sign-up error message used for unknown failures.
   * @returns Nothing.
   */
  private setGenericSignUpError() {
    this.errorMessage.set('Sign-Up failed. Please try again.');
  }

  /**
   * Returns a random color from the predefined contact color palette.
   * @returns A color string selected from CONTACT_COLORS.
   */
  private getRandomColor() {
    const index = Math.floor(Math.random() * CONTACT_COLORS.length);
    return CONTACT_COLORS[index];
  }
}
