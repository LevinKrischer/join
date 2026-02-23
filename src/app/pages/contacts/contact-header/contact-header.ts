import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContactWithInitials } from '../../../core/db/contacts.db';

@Component({
  selector: 'app-contact-header',
  imports: [],
  templateUrl: './contact-header.html',
  styleUrl: './contact-header.scss',
})
export class ContactHeader {
  @Input() contact: ContactWithInitials | null = null;
  @Output() back = new EventEmitter<void>();
}
