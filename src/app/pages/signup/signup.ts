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
export class Signup implements AfterViewInit {
  private supabaseService = inject(SupabaseService);
  private contactsDb = inject(ContactsDb);
  private router = inject(Router);
  private feedback = viewChild.required<UserFeedbackComponent>('feedback');

  errorMessage = signal('');
  isSubmitting = signal(false);

  ngAfterViewInit() {
    /** Datt brauchen wir eigentlich nicht mehr...
    if (this.route.snapshot.queryParams['loggedOut']) {
      this.feedback().show('You logged out successfully!');
    }
    */
  }

  async onSubmitted(credentials: { name: string; email: string; password: string }) {
    if (this.isSubmitting()) return;

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    try {
      const { data, error } = await this.supabaseService.signUp(credentials.email, credentials.password);

      if (error) {
        this.errorMessage.set(error.message);
        return;
      }

      if (!data.user) {
        this.errorMessage.set('Sign-Up failed. Please try again.');
        return;
      }

      await this.contactsDb.setContact({
        name: credentials.name,
        email: credentials.email,
        phone: '',
        color: this.getRandomColor(),
      });

      // Sign-up can create a session depending on Supabase auth settings.
      // Explicitly sign out so users must log in manually afterwards.
      await this.supabaseService.signOut();

      this.feedback().show('You signed up successfully! Please check your email to confirm.');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch {
      this.errorMessage.set('Sign-Up failed. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getRandomColor() {
    const index = Math.floor(Math.random() * CONTACT_COLORS.length);
    return CONTACT_COLORS[index];
  }
}
