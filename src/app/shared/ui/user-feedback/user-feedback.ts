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

  constructor(private cdr: ChangeDetectorRef) { }

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
