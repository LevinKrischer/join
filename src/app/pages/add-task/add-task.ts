import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TaskAddFormComponent } from '../../components/task-add-form/task-add-form';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [TaskAddFormComponent],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {
  constructor(private router: Router) {}

  onTaskCreated() {
    this.router.navigate(['/board']);
  }
}
