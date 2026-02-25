import { Component } from '@angular/core';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { isValidName, isValidEmail, isValidPhone } from '../../core/utils/validation';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-add-task',
  standalone: true,

  imports: [InputFieldComponent, Button],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {}
