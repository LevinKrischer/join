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

  /**
   * Displays logout feedback when the route contains the loggedOut query param.
   * @returns Nothing.
   */
  ngAfterViewInit() {
    const loggedOut = this.route.snapshot.queryParams['loggedOut'];
    if (loggedOut) {
      const name = loggedOut !== 'true' ? loggedOut : '';
      const msg = name ? `You logged out successfully, ${name}!` : 'You logged out successfully';
      this.feedback().show(msg);
    }
  }

  /**
   * Handles login form submission and triggers post-login flow.
   * @param credentials Submitted login credentials.
   * @returns Promise that resolves when submission handling is finished.
   */
  async onSubmitted(credentials: { email: string; password: string }) {
    this.errorMessage.set('');
    await this.runLoginFlow(credentials);
  }

  /**
   * Executes login flow with centralized error handling.
   * @param credentials Submitted login credentials.
   * @returns Promise that resolves when the login attempt has completed.
   */
  private async runLoginFlow(credentials: { email: string; password: string }) {
    try {
      const { error, userName } = await this.supabaseService.signIn(credentials.email, credentials.password);
      if (error) {
        this.errorMessage.set(error.message);
        return;
      }
      this.handleSuccessfulLogin(userName);
    } catch {
      this.setGenericLoginError();
    }
  }

  /**
   * Handles state updates and navigation after a successful login.
   * @param userName Display name returned by sign-in process.
   * @returns Nothing.
   */
  private handleSuccessfulLogin(userName: string) {
    sessionStorage.setItem('show-summary-mobile-greeting', '1');
    this.feedback().show(`You logged in successfully, ${userName}!`);
    setTimeout(() => this.router.navigate(['/summary']), 1500);
  }

  /**
   * Sets the generic login error message for unexpected failures.
   * @returns Nothing.
   */
  private setGenericLoginError() {
    this.errorMessage.set('Log-In failed. Please check your credentials, your connection or sign up');
  }




}
