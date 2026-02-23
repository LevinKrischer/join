import { Component, Input } from '@angular/core';

/**
 * A flexible container component for grouping related content.
 * Designed to work with `<ng-content>` to wrap any HTML or components.
 * * @example
 * <ui-card variant="dark">
 * <h3>Card Title</h3>
 * <p>This is some content inside a dark-themed card.</p>
 * </ui-card>
 * !!! NOTE: not used yet!!!
 */
@Component({
  selector: 'ui-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class Card {
  /**
   * The color theme of the card.
   * - `light`: Standard background (usually white or light gray).
   * - `dark`: High-contrast background for dark mode or specific UI sections.
   * @default 'light'
   */
  @Input() variant: 'light' | 'dark' = 'light';
}
