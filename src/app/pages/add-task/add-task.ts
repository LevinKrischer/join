import { Component, inject } from '@angular/core';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { Button } from '../../shared/ui/button/button';
import { TasksDb } from '../../core/db/tasks.db';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [InputFieldComponent, Button],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  tasksDb = inject(TasksDb);
}
