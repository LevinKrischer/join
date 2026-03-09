import { Component } from '@angular/core';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';

@Component({
  selector: 'app-register-form',
  imports: [ModalWrapper],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
})
export class RegisterForm {}
