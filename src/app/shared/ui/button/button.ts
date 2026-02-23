import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'urgent' | 'medium' | 'low' | 'fab-primary' | 'fab-secondary' = 'primary';
  @Input() icon: 'without' | 'add' | 'create' | 'cancel' | 'urgent' | 'medium' | 'low' = 'without';
  @Input() disabled = false;

}
