import { Component } from '@angular/core';
import { TaskAddFormComponent } from '../../components/task-add-form/task-add-form';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [TaskAddFormComponent],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {}
