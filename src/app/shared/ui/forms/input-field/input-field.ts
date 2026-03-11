import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isValidName, isValidEmail, isValidPhone } from '../../../../core/utils/validation';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-field.html',
  styleUrls: ['./input-field.scss'],
})
export class InputFieldComponent {
  @Input() type: string | 'text' | 'date' | 'email' | 'tel' | 'password' = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() icon: string | null = null;
  @Input() iconAlt = '';
  @Input() iconClickable = false;
  @Input() error: string | null = null;
  @Input() maxlength: number | null = null;
  @Input() minDate: string | null = null;
  @Input() isRequired: boolean = false;
  @Input() displayLabel: boolean = true;
  @Input() reserveErrorSpace: boolean = false;

  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>();

  @Output() blur = new EventEmitter<void>();
  @Output() inputChange = new EventEmitter<Event>();
  @Output() focus = new EventEmitter<void>();
  @Output() iconClick = new EventEmitter<void>();

  /**
   * Emits the updated input value and original input event.
   * @param event Native input event from the field.
   * @returns Nothing.
   */
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.modelChange.emit(value);
    this.inputChange.emit(event);
  }

  /**
   * Emits icon-click event when icon interaction is enabled.
   * @returns Nothing.
   */
  onIconClick() {
    if (!this.iconClickable) return;
    this.iconClick.emit();
  }

  /**
   * Prevents focus loss on icon press when icon interaction is enabled.
   * @param event Mouse event from icon pointer-down.
   * @returns Nothing.
   */
  onIconPointerDown(event: MouseEvent) {
    if (!this.iconClickable) return;
    event.preventDefault();
  }

  /**
   * Initializes minimum date for date inputs when not provided externally.
   * @returns Nothing.
   */
  ngOnInit() {
    if (this.type === 'date' && !this.minDate) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      this.minDate = `${yyyy}-${mm}-${dd}`;
    }
  }
}
