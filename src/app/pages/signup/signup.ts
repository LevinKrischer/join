import { Component, inject, signal, viewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupForm } from '../../components/signup-form/signup-form';
import { SupabaseService } from '../../services/supabase';
import { ContactsDb } from '../../core/db/contacts.db';
import { ContactAddFormComponent } from '../../components/contact-add-form/contact-add-form';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';

@Component({
  selector: 'app-signup',
  imports: [SignupForm, UserFeedbackComponent],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup implements AfterViewInit {
  private supabaseService = inject(SupabaseService);
  private contactsDb = inject(ContactsDb);
  private contactAddForm = inject(ContactAddFormComponent);
  private router = inject(Router);
  private feedback = viewChild.required<UserFeedbackComponent>('feedback');

  errorMessage = signal('');

  ngAfterViewInit() {
    /** Datt brauchen wir eigentlich nicht mehr...
    if (this.route.snapshot.queryParams['loggedOut']) {
      this.feedback().show('You logged out successfully!');
    }
    */
  }

  async onSubmitted(credentials: { name: string; email: string; password: string }) {
    this.errorMessage.set('');

    try {
      const { error } = await this.supabaseService.signUp(credentials.email, credentials.password);

      const newContactData  = await this.contactsDb.setContact({
          name: credentials.name,
          email: credentials.email,
          phone: '',
          color: this.contactAddForm.getRandomColor()
        });

      if (error) {
        this.errorMessage.set(error.message);
        return;
      }
      this.feedback().show('You signed up successfully! Please check your email to confirm.');
      setTimeout(() => this.router.navigate(['/login']), 1500);
    } catch {
      this.errorMessage.set('Sign-Up failed. Please try again.');
    }
  }
}
