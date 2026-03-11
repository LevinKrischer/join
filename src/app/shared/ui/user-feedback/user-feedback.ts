import { Component, Input, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-user-feedback',
  standalone: true,
  templateUrl: './user-feedback.html',
  styleUrls: ['./user-feedback.scss']
})
export class UserFeedbackComponent {

  @Input() message = '';
  @Input() animation: 'slide-right' | 'slide-up' = 'slide-right';
  @Input() icon = '';
  visible = false;

  private timeoutId: any;

  /**
   * Creates the user-feedback component.
   * @param cdr Change detector used to force UI updates for timed visibility changes.
   */
  constructor(private cdr: ChangeDetectorRef) { }

  /**
   * Shows a feedback message and hides it automatically after a timeout.
   * @param message Feedback text to display.
   * @returns Nothing.
   */
  show(message: string) {
    this.message = message;
    this.visible = true;
    this.cdr.detectChanges();

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.visible = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
