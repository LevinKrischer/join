import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksDb } from '../../core/db/tasks.db';
import { SupabaseService } from '../../services/supabase';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
  private supabase = inject(SupabaseService);
  private mobileGreetingTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly mobileGreetingStorageKey = 'show-summary-mobile-greeting';
  tasks = this.tasksDb.tasks;
  userName = signal('');
  isGuestSession = signal(false);
  showMobileGreetingOverlay = signal(false);
  isPreparingMobileGreeting = signal(false);
  hasDisplayName = computed(() => this.userName().trim().length > 0 && !this.isGuestSession());

  personalizedGreeting = computed(() => {
    const greeting = this.getTimeBasedGreeting();

    if (!this.hasDisplayName()) {
      return `${greeting}!`;
    }

    return `${greeting},`;
  });

  todoCount = computed(() => this.tasks().filter((task) => task.status === 'todo').length);
  doneCount = computed(() => this.tasks().filter((task) => task.status === 'done').length);
  inProgressCount = computed(() => this.tasks().filter((task) => task.status === 'in-progress').length);
  awaitFeedbackCount = computed(() => this.tasks().filter((task) => task.status === 'await-feedback').length);
  urgentCount = computed(() => this.tasks().filter((task) => task.priority === 'urgent').length);
  totalTasksCount = computed(() => this.tasks().length);

  nextOpenDueDate = computed(() => {
    const upcomingDates = this.getUpcomingOpenTaskDates();

    if (upcomingDates.length === 0) {
      return 'No upcoming deadline';
    }

    return this.formatDueDate(upcomingDates[0]);
  });

  /**
   * Returns the greeting text based on the current local hour.
   * @ Greeting text for the current time window.
   */
  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 0 && hour < 5) {
      return 'Good night';
    } else if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }

  /**
   * Loads session context and resolves the user greeting name.
   * @ Promise that resolves when greeting context initialization is complete.
   */
  private async loadCurrentUserGreetingContext() {
    const { data } = await this.supabase.getSession();
    const sessionUser = data.session?.user;
    const email = this.getSessionEmail(sessionUser);
    if (!email) {
      this.resetUserContextForMissingEmail();
      return;
    }
    if (this.setGuestSessionState(email)) {
      this.userName.set('');
      return;
    }
    await this.resolveAndSetUserName(sessionUser, email);
  }

  /**
   * Normalizes the session email to lowercase.
   * @ sessionUser Current authenticated session user.
   * @ Lowercase email string or an empty string.
   */
  private getSessionEmail(sessionUser: { email?: string | null } | null | undefined): string {
    return sessionUser?.email?.toLowerCase() ?? '';
  }

  /**
   * Clears user specific greeting state when no valid email exists.
   */
  private resetUserContextForMissingEmail() {
    this.userName.set('');
    this.isGuestSession.set(false);
  }

  /**
   * Updates guest-session state and returns whether current user is guest.
   * @ email Normalized email of the current session user.
   * @ True if the session belongs to the configured guest account.
   */
  private setGuestSessionState(email: string): boolean {
    const isGuest = email === environment.guestEmail.toLowerCase();
    this.isGuestSession.set(isGuest);
    return isGuest;
  }

  /**
   * Extracts display name from user metadata.
   * @ sessionUser Current authenticated session user.
   * @ Trimmed display name from metadata or an empty string.
   */
  private getMetadataName(sessionUser: { user_metadata?: Record<string, unknown> | null } | null | undefined): string {
    return String(sessionUser?.user_metadata?.['full_name'] ?? sessionUser?.user_metadata?.['name'] ?? '').trim();
  }

  /**
   * Resolves the best available display name and stores it in state.
   * @ sessionUser Current authenticated session user.
   * @ email Normalized email of the current session user.
   * @ Promise that resolves when the name has been written to state.
   */
  private async resolveAndSetUserName(sessionUser: { user_metadata?: Record<string, unknown> | null } | null | undefined, email: string) {
    const { data: contact, error } = await this.supabase.client.from('contacts').select('name').eq('email', email).maybeSingle();
    const metadataName = this.getMetadataName(sessionUser);
    const fallback = this.getNameFallbackFromEmail(email);
    if (error) {
      this.userName.set(metadataName || fallback);
      return;
    }
    const fullContactName = (contact?.name ?? '').trim();
    this.userName.set(fullContactName || metadataName || fallback);
  }

  /**
   * Builds a display-name fallback from the email local part.
   * @ email Email address used to derive a fallback name.
   * @ Human-readable fallback name.
   */
  private getNameFallbackFromEmail(email: string): string {
    const localPart = email.split('@')[0] ?? '';
    if (!localPart) {
      return '';
    }

    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
      .trim();
  }

  /**
   * Parses a due date string to a valid Date instance.
   * @ dueDate Raw due-date string from task data.
   * @ Parsed Date or null when the input is invalid.
   */
  private parseDate(dueDate: string): Date | null {
    if (!dueDate) {
      return null;
    }

    const dateOnlyMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(dueDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Returns all open-task due dates that are on or after today.
   * @returns Sorted list of upcoming due dates.
   */
  private getUpcomingOpenTaskDates(): Date[] {
    const todayStart = this.getTodayStart();

    return this.tasks()
      .filter((task) => task.status !== 'done')
      .map((task) => this.parseDate(task.due_date))
      .filter((date): date is Date => date !== null)
      .filter((date) => this.isDateOnOrAfter(date, todayStart))
      .sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Returns today at local midnight.
   * @returns Date instance at the start of the current day.
   */
  private getTodayStart(): Date {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  /**
   * Checks whether a date is on or after the given start date.
   * @param date Date to validate.
   * @param startDate Inclusive lower date boundary.
   * @returns True when date is on or after startDate.
   */
  private isDateOnOrAfter(date: Date, startDate: Date): boolean {
    return date.getTime() >= startDate.getTime();
  }

  /**
   * Formats a due date for summary display.
   * @param dueDate Due date to format.
   * @returns Localized date label for the summary card.
   */
  private formatDueDate(dueDate: Date): string {
    return dueDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Initializes summary data and optionally starts mobile greeting overlay.
   * @ Promise that resolves when initialization steps are completed.
   */
  async ngOnInit() {
    const shouldShowMobileGreetingOverlay = this.consumeMobileGreetingTrigger();

    this.prepareMobileGreetingOverlay(shouldShowMobileGreetingOverlay);
    await this.initializeSummaryData();
    this.showMobileGreetingOverlayIfNeeded(shouldShowMobileGreetingOverlay);
    this.tasksDb.subscribeToTaskChanges();
  }

  /**
   * Flags the mobile greeting as preparing before data load.
   * @ shouldShowMobileGreetingOverlay Whether the overlay should be shown.
   */
  private prepareMobileGreetingOverlay(shouldShowMobileGreetingOverlay: boolean) {
    if (shouldShowMobileGreetingOverlay) {
      this.isPreparingMobileGreeting.set(true);
    }
  }

  /**
   * Loads tasks and greeting context in parallel.
   * @ Promise that resolves when both async operations are completed.
   */
  private async initializeSummaryData() {
    await Promise.all([
      this.tasksDb.getTasks(),
      this.loadCurrentUserGreetingContext(),
    ]);
  }

  /**
   * Starts the mobile greeting overlay when the trigger is active.
   * @ shouldShowMobileGreetingOverlay Whether the overlay should be shown.
   */
  private showMobileGreetingOverlayIfNeeded(shouldShowMobileGreetingOverlay: boolean) {
    if (shouldShowMobileGreetingOverlay) {
      this.startMobileGreetingOverlay();
    }
  }

  /**
   * Consumes and clears the one-time mobile greeting trigger from session storage.
   * @ True when the greeting overlay should be displayed on mobile.
   */
  private consumeMobileGreetingTrigger(): boolean {
    const shouldShow = sessionStorage.getItem(this.mobileGreetingStorageKey) === '1';
    sessionStorage.removeItem(this.mobileGreetingStorageKey);

    return shouldShow && window.innerWidth < 1100;
  }

  /**
   * Displays the mobile greeting overlay for a limited duration.
   */
  private startMobileGreetingOverlay() {
    this.showMobileGreetingOverlay.set(true);
    this.mobileGreetingTimeout = setTimeout(() => {
      this.showMobileGreetingOverlay.set(false);
      this.isPreparingMobileGreeting.set(false);
      this.mobileGreetingTimeout = null;
    }, 3000);
  }

  /**
   * Cleans up timers and realtime task subscriptions.
   */
  ngOnDestroy() {
    if (this.mobileGreetingTimeout) {
      clearTimeout(this.mobileGreetingTimeout);
    }
    this.tasksDb.unsubscribeFromTaskChanges();
  }

}

