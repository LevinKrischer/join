import { Component, OnInit, OnDestroy, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { InputFieldComponent } from '../../shared/ui/input-field/input-field';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, Button],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);

  // All tasks from DB
  tasks = this.tasksDb.tasks;

  // Filtered by status for each kanban column
  todoTasks = computed(() => this.tasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter((t) => t.status === 'in-progress'));
  awaitFeedbackTasks = computed(() => this.tasks().filter((t) => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
  }

  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
    this.tasksDb.subscribeToTaskChanges();
  }
}
