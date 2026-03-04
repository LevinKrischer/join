import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ui-textarea',
  imports: [],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
})
export class Textarea {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() placeholder: string = '';
  @Input() rows: number = 3;
  @Input() maxlength: number | null = null;
  @Input() errorMessage: string = '';
  @Input() isRequired: boolean = false;

  @Input() model: string = '';
  @Output() modelChange = new EventEmitter<string>();

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.modelChange.emit(value);
  }
}
