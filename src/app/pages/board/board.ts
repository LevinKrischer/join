import { Component, OnInit, OnDestroy, computed, inject, signal, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { Button } from '../../shared/ui/button/button';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { TaskBoard } from './task-board/task-board';
import { TaskAddFormComponent } from '../../components/task-add-form/task-add-form';
import { TaskDetailComponent } from './task-detail/task-detail';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, InputFieldComponent, Button, TaskBoard, TaskAddFormComponent, TaskDetailComponent, UserFeedbackComponent],

  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
  private route = inject(ActivatedRoute);
  tasks = this.tasksDb.tasks;

  todoTasks = computed(() => this.tasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasks().filter((t) => t.status === 'in-progress'));
  awaitFeedbackTasks = computed(() => this.tasks().filter((t) => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));

  isModalOpen = signal(false);
  modalMode: 'add' | 'detail' = 'add';
  selectedTaskId = signal<number | null>(null);
  selectedTask = computed(() => this.tasks().find(t => t.id === this.selectedTaskId()) ?? null);

  openAdd() {
    this.modalMode = 'add';
    this.selectedTaskId.set(null);
    this.isModalOpen.set(true);
  }

  openDetail(task: Task) {
    this.modalMode = 'detail';
    this.selectedTaskId.set(task.id);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
constructor() {
    effect(() => {
      const fragment = this.route.snapshot.fragment;
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 0);
      }
    });
  }


  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
  }

  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
    this.tasksDb.subscribeToTaskChanges();
  }

  feedbackRef = viewChild.required<UserFeedbackComponent>('feedback');

  onTaskDeleted() {
    this.feedbackRef().show('Task successfully deleted');
  }

  /* Search Task Input */
  searchTerm = signal('');

  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.tasks().filter(
      (t) =>
        term === '' ||
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term),
    );
  });
}
