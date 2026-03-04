import { Component, signal, input, output, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksDb, Task, Subtask } from '../../../core/db/tasks.db';
import { TaskAddFormComponent } from '../../../components/task-add-form/task-add-form';
import { UserFeedbackComponent } from '../../../shared/ui/user-feedback/user-feedback';
import { ModalWrapper } from '../../../shared/ui/modal-wrapper/modal-wrapper';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, TaskAddFormComponent, UserFeedbackComponent],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.scss'],
})
export class TaskDetailComponent {
  // Injections
  private taskDbSingleton = inject(TasksDb);

  // Inputs
  task = input.required<Task>(); // Wired in board.html

  // Outputs
  close = output<void>();

  // Using child comps
  userFeedback = viewChild.required<UserFeedbackComponent>('feedback');

  // Boolean signals
  isEditing = signal(false);

  /** returns the appropriate priority icon path for the current task */
  get priorityIcon(): string {
    const pr = this.task()?.priority?.toLowerCase() || '';
    switch (pr) {
      case 'low':
        return 'assets/icons/prio-low-small-task-32px.svg';
      case 'medium':
        return 'assets/icons/prio-medium-small-task-32px.svg';
      case 'urgent':
        return 'assets/icons/prio-urgent-small-task-32px.svg';
      default:
        return '';
    }
  }

  get categoryColor(): string {
    const cat = this.task()?.category?.toLowerCase() || '';
    switch (cat) {
      case 'user story':
        return '#3f51b5';
      case 'technical task':
        return '#009688';
      case 'bug':
        return '#e91e63';
      default:
        return '#607d8b';
    }
  }

  initials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  async deleteTask() {
    try {
      await this.taskDbSingleton.deleteTask(this.task().id);
      this.userFeedback().show('Task has been deleted.');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      this.close.emit();
    } catch (err) {
      console.error('Failed to delete task:', err);
      this.userFeedback().show('Delete failed. Please try again.');
    }
  }

  updateTask() {
    this.isEditing.set(true);
  }

  async onTaskUpdated() {
    this.isEditing.set(false);
  }

  onEditCancelled() {
    this.isEditing.set(false);
  }

  async toggleSubtask(subtask: Subtask) {
    try {
      subtask.done = !subtask.done;

      await this.taskDbSingleton.updateTask(this.task().id, {
        subtasks: this.task().subtasks,
      });

    } catch (err) {
      console.error('Failed to update subtask:', err);
      subtask.done = !subtask.done;
      this.userFeedback().show('Failed to update subtask. Please try again.');
    }
  }
}
