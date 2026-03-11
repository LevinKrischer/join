import { Component, computed, signal, inject, output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { TasksDb, Task } from '../../../core/db/tasks.db';
import { TaskCardComponent } from '../task-card/task-card';
import { TaskAddFormComponent } from '../../../components/task-add-form/task-add-form';
import { HorizontalScrollDirective } from '../../../services/horizontal-scroll.directive';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TaskCardComponent,
    TaskAddFormComponent,
    HorizontalScrollDirective,
  ],
  templateUrl: './task-board.html',
  styleUrls: ['./task-board.scss'],
})
export class TaskBoard {
  private tasksDb = inject(TasksDb);

  open = output<Task>();

  // Detects if device supports touch (mobile/tablet)
  isMobile = signal(this.detectTouchDevice());
  dragStartDelay = computed(() => (this.isMobile() ? 500 : 0));

  // Keep the input as a signal so computed columns re-evaluate when the
  // parent passes a new array (e.g. filteredTasks()).
  private _tasks = signal<Task[]>([]);

  @Input() set tasks(v: Task[] | null | undefined) {
    this._tasks.set(v ?? []);
  }

  /**
   * Returns the current task list from the internal signal.
   * @returns Current tasks used by board columns.
   */
  get tasks() {
    return this._tasks();
  }

  showAddTaskForm = signal(false);
  addTaskStatus = signal<Task['status']>('todo');

  todoTasks = computed(() => this._tasks().filter((t) => t.status === 'todo'));
  inProgressTasks = computed(() => this._tasks().filter((t) => t.status === 'in-progress'));
  reviewTasks = computed(() => this._tasks().filter((t) => t.status === 'await-feedback'));
  doneTasks = computed(() => this._tasks().filter((t) => t.status === 'done'));

  /**
   * Emits the selected task to open its detail view.
   * @param task Task that should be opened.
   * @returns Nothing.
   */
  openTaskDetail(task: Task) {
    this.open.emit(task);
  }

  /**
   * Shows the add-task form overlay for a given status column.
   * @param status Status used to prefill the add-task form.
   * @returns Nothing.
   */
  openAddTask(status: Task['status']) {
    this.addTaskStatus.set(status);
    this.showAddTaskForm.set(true);
  }

  /**
   * Hides the add-task form overlay.
   * @returns Nothing.
   */
  closeAddTask() {
    this.showAddTaskForm.set(false);
  }

  /**
   * Closes add-task form and refreshes tasks after creation.
   * @returns Promise that resolves when tasks are refreshed.
   */
  async onTaskCreated() {
    this.showAddTaskForm.set(false);
    await this.refreshTasks();
  }

  /**
   * Handles drag & drop events for tasks.
   * @param event The drag-and-drop event with source and target containers.
   * @param targetStatus Status of the destination column.
   * @returns Promise that resolves when persistence and refresh are done.
   */
  async onTaskDrop(event: CdkDragDrop<Task[]>, targetStatus: Task['status']) {
    if (event.previousContainer === event.container) {
      await this.reorderTasksWithinColumn(event);
    } else {
      await this.moveTaskAcrossColumns(event, targetStatus);
    }
    await this.refreshTasks();
  }

  /**
   * Reorders tasks inside one column and persists new order indices.
   * @param event The drag-and-drop event within the same column.
   * @returns Promise that resolves after order update is persisted.
   */
  private async reorderTasksWithinColumn(event: CdkDragDrop<Task[]>) {
    const columnTasks = [...event.container.data];
    moveItemInArray(columnTasks, event.previousIndex, event.currentIndex);
    await this.tasksDb.updateTaskOrder(this.withRecalculatedOrder(columnTasks));
  }

  /**
   * Moves a task across columns, updates status and persists both columns.
   * @param event The drag-and-drop event between different columns.
   * @param targetStatus Status of the destination column.
   * @returns Promise that resolves after order updates are persisted.
   */
  private async moveTaskAcrossColumns(event: CdkDragDrop<Task[]>, targetStatus: Task['status']) {
    const sourceTasks = [...event.previousContainer.data];
    const targetTasks = [...event.container.data];
    transferArrayItem(sourceTasks, targetTasks, event.previousIndex, event.currentIndex);
    targetTasks[event.currentIndex].status = targetStatus;
    const sourceTasksUpdated = this.withRecalculatedOrder(sourceTasks);
    const targetTasksUpdated = this.withRecalculatedOrder(targetTasks);
    await this.tasksDb.updateTaskOrder([...sourceTasksUpdated, ...targetTasksUpdated]);
  }

  /**
   * Returns tasks with normalized zero-based order values.
   * @param tasks Tasks that require recalculated order fields.
   * @returns New task array including updated order numbers.
   */
  private withRecalculatedOrder(tasks: Task[]): Task[] {
    return tasks.map((t, index) => ({ ...t, order: index }));
  }

  /**
   * Reloads tasks from persistence.
   * @returns Promise that resolves when tasks are loaded.
   */
  private async refreshTasks() {
    await this.tasksDb.getTasks();
  }

  /**
   * Detects if the device supports touch events (mobile/tablet).
   * @returns True if touch events are supported.
   */
  private detectTouchDevice(): boolean {
    return (
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    );
  }

  /**
   * Handles status changes triggered from a task card action.
   * @param event Contains task to move and its target status.
   * @returns Promise that resolves after persistence and refresh.
   */
  async onCardStatusChange(event: { task: Task; newStatus: Task['status'] }) {
    const { task, newStatus } = event;

    if (this.isSameStatus(task, newStatus)) {
      return;
    }

    const sourceTasks = this.getSourceTasksAfterCardMove(task);
    const targetTasks = this.getTargetTasksForCardMove(newStatus);
    const movedTask = this.createMovedTask(task, newStatus, targetTasks.length);
    await this.tasksDb.updateTaskOrder([...sourceTasks, ...targetTasks, movedTask]);
    await this.refreshTasks();
  }

  /**
   * Checks whether task already has the requested status.
   * @param task Task being evaluated.
   * @param newStatus Requested target status.
   * @returns True when no move is required.
   */
  private isSameStatus(task: Task, newStatus: Task['status']): boolean {
    return task.status === newStatus;
  }

  /**
   * Builds updated source-column tasks after removing moved task.
   * @param task Task that is moved away from its current column.
   * @returns Source-column tasks with normalized order.
   */
  private getSourceTasksAfterCardMove(task: Task): Task[] {
    const sourceTasks = this._tasks().filter((t) => t.status === task.status && t.id !== task.id);
    return this.withRecalculatedOrder(sourceTasks);
  }

  /**
   * Builds updated destination-column tasks before inserting moved task.
   * @param newStatus Requested destination status.
   * @returns Destination-column tasks with normalized order.
   */
  private getTargetTasksForCardMove(newStatus: Task['status']): Task[] {
    const targetTasks = this._tasks().filter((t) => t.status === newStatus);
    return this.withRecalculatedOrder(targetTasks);
  }

  /**
   * Creates moved task payload with destination status and order.
   * @param task Original task payload.
   * @param newStatus Requested destination status.
   * @param order New order index inside destination column.
   * @returns Task object ready for persistence.
   */
  private createMovedTask(task: Task, newStatus: Task['status'], order: number): Task {
    return { ...task, status: newStatus, order };
  }
}
