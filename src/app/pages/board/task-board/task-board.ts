import { Component, computed, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { TasksDb, Task } from '../../../core/db/tasks.db';
import { TaskCardComponent } from '../task-card/task-card';
import { TaskAddFormComponent } from '../../../components/task-add-form/task-add-form';
import { HorizontalScrollDirective } from "../../../services/horizontal-scroll.directive";


@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent, TaskAddFormComponent, HorizontalScrollDirective],
  templateUrl: './task-board.html',
  styleUrls: ['./task-board.scss'],
})
export class TaskBoard {
  private tasksDb = inject(TasksDb);

  open = output<Task>();

  showAddTaskForm = signal(false);
  addTaskStatus = signal<Task['status']>('todo');

  todoTasks = computed(() => this.tasksDb.tasks().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasksDb.tasks().filter(t => t.status === 'in-progress'));
  reviewTasks = computed(() => this.tasksDb.tasks().filter(t => t.status === 'await-feedback'));
  doneTasks = computed(() => this.tasksDb.tasks().filter(t => t.status === 'done'));

  /** Emits the selected task to open its detail view. */
  openTaskDetail(task: Task) {
    this.open.emit(task);
  }

  /** Shows the add-task form overlay. */
  openAddTask(status: Task['status']) {
    this.addTaskStatus.set(status);
    this.showAddTaskForm.set(true);
  }

  /** Hides the add-task form overlay. */
  closeAddTask() {
    this.showAddTaskForm.set(false);
  }

  /** Closes the add-task form and refreshes the task list after creation. */
  async onTaskCreated() {
    this.showAddTaskForm.set(false);
    await this.tasksDb.getTasks();
  }

  /**
   * Handles drag & drop events for tasks.
   * Updates both local state and database with new status and order.
   * @param event - The CDK drag & drop event containing source/target container data.
   * @param targetStatus - The status of the column the task was dropped into.
   */
  async onTaskDrop(event: CdkDragDrop<Task[]>, targetStatus: Task['status']) {
    const task = event.item.data || event.previousContainer.data[event.previousIndex];

    // Case 1: Moving within the same column (reordering)
    if (event.previousContainer === event.container) {
      const columnTasks = [...event.container.data];
      moveItemInArray(columnTasks, event.previousIndex, event.currentIndex);

      // Update order numbers for all tasks in this column
      const tasksToUpdate = columnTasks.map((t, index) => ({
        ...t,
        order: index
      }));

      await this.tasksDb.updateTaskOrder(tasksToUpdate);

    }
    // Case 2: Moving to a different column
    else {
      const sourceTasks = [...event.previousContainer.data];
      const targetTasks = [...event.container.data];

      transferArrayItem(
        sourceTasks,
        targetTasks,
        event.previousIndex,
        event.currentIndex
      );

      // Update status and order for moved task
      const movedTask = targetTasks[event.currentIndex];
      movedTask.status = targetStatus;

      // Recalculate order numbers for both columns
      const sourceTasksUpdated = sourceTasks.map((t, index) => ({
        ...t,
        order: index
      }));

      const targetTasksUpdated = targetTasks.map((t, index) => ({
        ...t,
        order: index
      }));

      await this.tasksDb.updateTaskOrder([...sourceTasksUpdated, ...targetTasksUpdated]);
    }

    // Refresh tasks from database
    await this.tasksDb.getTasks();
  }
}
