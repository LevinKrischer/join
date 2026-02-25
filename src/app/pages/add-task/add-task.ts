import { Component, inject } from '@angular/core';
import { TasksDb } from '../../core/db/tasks.db';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  tasksDb = inject(TasksDb);
}
