import { Component } from '@angular/core';
import { BackButton } from '../../shared/ui/forms/back-button/back-button';

@Component({
  selector: 'app-help',
  imports: [BackButton],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
}
