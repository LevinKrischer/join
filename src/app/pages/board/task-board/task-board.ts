import { Component, computed, signal, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksDb, Task } from '../../../core/db/tasks.db';
import { TaskCardComponent } from '../task-card/task-card';
import { HorizontalScrollDirective } from "../../../services/horizontal-scroll.directive";


@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, HorizontalScrollDirective],
  templateUrl: './task-board.html',
  styleUrls: ['./task-board.scss'],
})
export class TaskBoard implements OnInit {
  private tasksDb = inject(TasksDb);

  @Output() open = new EventEmitter<Task>();

  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);
  showAddTaskForm = signal(false);

  todoTasks = computed(() => this.tasks().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter(t => t.status === 'in-progress'));
  reviewTasks = computed(() => this.tasks().filter(t => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasks().filter(t => t.status === 'done'));

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasks.set(this.tasksDb.tasks());
    this.tasksDb.subscribeToTaskChanges();
  }

  openTaskDetail(task: Task) {
    this.open.emit(task);
  }

  openAddTask() {
    this.showAddTaskForm.set(true);
  }

  closeAddTask() {
    this.showAddTaskForm.set(false);
  }
}
