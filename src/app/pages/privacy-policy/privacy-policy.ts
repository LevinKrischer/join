import { Component } from '@angular/core';
import { BackButton } from '../../shared/ui/forms/back-button/back-button';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [BackButton],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {

}
