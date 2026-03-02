import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { Button } from '../../shared/ui/button/button';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { TaskBoard } from './task-board/task-board';
import { TaskAddFormComponent } from '../../components/task-add-form/task-add-form';
import { TaskDetailComponent } from './task-detail/task-detail';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    InputFieldComponent,
    Button,
    TaskBoard,
    TaskAddFormComponent,
    TaskDetailComponent
  ],

  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);

  isModalOpen = signal(false);
  modalMode: 'add' | 'detail' = 'add';
  selectedTask = signal<Task | null>(null);

  openAdd() {
    this.modalMode = 'add';
    this.selectedTask.set(null);
    this.isModalOpen.set(true);
  }

  openDetail(task: Task) {
    this.modalMode = 'detail';
    this.selectedTask.set(task);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
  }

  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
    //this.tasksDb.subscribeToTaskChanges();
  }
}
