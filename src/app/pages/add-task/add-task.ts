import { Component, inject, OnInit, signal } from '@angular/core';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';
import { TasksDb } from '../../core/db/tasks.db';
import { ContactsDb } from '../../core/db/contacts.db';
import { ContactPicker } from '../../shared/ui/forms/contact-picker/contact-picker';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [InputFieldComponent, Button, ContactPicker],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask implements OnInit {
  tasksDb = inject(TasksDb);
  contactsDb = inject(ContactsDb);
  selectedContactIds = signal<number[]>([]);

  async ngOnInit() {
    await this.contactsDb.getContacts();
  }

  onContactsSelected(ids: number[]) {
    this.selectedContactIds.set(ids);
  }
}
