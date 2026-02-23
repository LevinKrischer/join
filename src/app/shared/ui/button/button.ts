import { Component, Input } from '@angular/core';

/**
 * A reusable button component that supports various visual styles and icons.
 * * @example
 * <ui-button
 * variant="secondary"
 * icon="cancel"
 * (click)="onDelete()">
 * Delete Task
 * </ui-button>
 */
@Component({
  selector: 'ui-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  /** * The underlying HTML button type.
   * @default 'button'
   */
  @Input() type: 'button' | 'submit' = 'button';

  /** * The visual style variant of the button.
   * - `primary` / `secondary`: Standard UI actions.
   * - `urgent` / `medium` / `low`: Priority-themed buttons (often color-coded).
   * - `fab-primary` / `fab-secondary`: Circular Floating Action Button styles.
   * @default 'primary'
   */
  @Input() variant:
    | 'primary'
    | 'secondary'
    | 'urgent'
    | 'medium'
    | 'low'
    | 'fab-primary'
    | 'fab-secondary' = 'primary';

  /** * Defines which icon to display within the button.
   * Set to `without` to hide the icon.
   * @default 'without'
   */
  @Input() icon: 'without' | 'add' | 'create' | 'cancel' | 'urgent' | 'medium' | 'low' = 'without';

  /** * Whether the button is disabled and non-interactive.
   * @default false
   */
  @Input() disabled = false;
}
