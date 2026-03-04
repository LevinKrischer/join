import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select {
  @Input() label: string = '';
  @Input() errorMessage: string = '';
  @Input() preselectedValue: string = '';
  @Input() selectedValue: any = '';
  @Input() options: { label: string; value: any }[] = [];
  @Input() isRequired: boolean = false;
}
