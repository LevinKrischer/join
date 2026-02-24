import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isValidName, isValidEmail, isValidPhone } from '../../../core/utils/validation';


@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-field.html',
  styleUrls: ['./input-field.scss']
})
export class InputFieldComponent {

  @Input() type = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() icon: string | null = null;
  @Input() error: string | null = null;
  @Input() maxlength: number | null = null;


  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>();

  @Output() blur = new EventEmitter<void>();
  @Output() inputChange = new EventEmitter<Event>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.modelChange.emit(value);
    this.inputChange.emit(event);
  }
}
