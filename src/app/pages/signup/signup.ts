import { Component } from '@angular/core';
import { SignupForm } from '../../components/signup-form/signup-form';

@Component({
  selector: 'app-signup',
  imports: [SignupForm],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {}
