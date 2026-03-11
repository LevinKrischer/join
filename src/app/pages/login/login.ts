import { Component, inject, signal, viewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginForm } from '../../components/login-form/login-form';
import { SupabaseService } from '../../services/supabase';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-login',
  imports: [LoginForm, UserFeedbackComponent, Button, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private feedback = viewChild.required<UserFeedbackComponent>('feedback');

  errorMessage = signal('');

  ngAfterViewInit() {
    if (this.route.snapshot.queryParams['loggedOut']) {
      this.feedback().show('You logged out successfully');
    }
  }

  async onSubmitted(credentials: { email: string; password: string }) {
    this.errorMessage.set('');

    try {
      const { error } = await this.supabaseService.signIn(credentials.email, credentials.password);
      if (error) {
        this.errorMessage.set(error.message);
        return;
      }
      this.feedback().show('You logged in successfully');
      setTimeout(() => this.router.navigate(['/summary']), 1500);

    } catch {
      this.errorMessage.set('Log-In failed. Please check your credentials, your connection or sign up');
    }
  }

}
