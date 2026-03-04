import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * A layout wrapper for modal content.
 * Provides a consistent backdrop and structure for dialogs or overlays.
 * @example
 * <ui-modal-wrapper (close)="isModalOpen = false" [contentPadding]="true">
 * <h2>Settings</h2>
 * <p>Modal content goes here...</p>
 * </ui-modal-wrapper>
 */
@Component({
  selector: 'ui-modal-wrapper',
  imports: [CommonModule],
  templateUrl: './modal-wrapper.html',
  styleUrl: './modal-wrapper.scss',
})
export class ModalWrapper {
  /**
   * Controls the size variant of the modal.
   * 'normal' - larger modal (default, max-width: 75.75rem)
   * 'small' - smaller modal (max-width defined in stylesheet)
   * Default: 'normal'
   */
  modalSize = input<'normal' | 'small'>('normal');

  /**
   * Controls whether the modal content should have padding.
   * When true, standard padding is applied (defined in stylesheet).
   * When false, no padding is applied.
   * Default: true
   */
  contentPadding = input<boolean>(true);

  /**
   * Emitted when the modal requests to be closed.
   * This can be triggered by clicking the close button or the backdrop.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Handles the internal close logic and triggers the 'close' output event.
   * Call this method from the template (e.g., on a backdrop click).
   */
  onClose() {
    this.close.emit();
  }
}
