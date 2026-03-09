import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksDb } from '../../core/db/tasks.db';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit, OnDestroy {
  private tasksDb = inject(TasksDb);
  tasks = this.tasksDb.tasks;

  todoCount = computed(() => this.tasks().filter((task) => task.status === 'todo').length);
  doneCount = computed(() => this.tasks().filter((task) => task.status === 'done').length);
  inProgressCount = computed(() => this.tasks().filter((task) => task.status === 'in-progress').length);
  awaitFeedbackCount = computed(() => this.tasks().filter((task) => task.status === 'await-feedback').length);
  urgentCount = computed(() => this.tasks().filter((task) => task.priority === 'urgent').length);
  totalTasksCount = computed(() => this.tasks().length);

  earliestOpenDueDate = computed(() => {
    const openTasks = this.tasks().filter((task) => task.status !== 'done');

    const validDates = openTasks 
      .map((task) => this.parseDate(task.due_date))
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime()); 

    return validDates[0].toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
    });
  });

  private parseDate(dueDate: string): Date | null {
    if (!dueDate) {
      return null;
    }

    const dateOnlyMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(dueDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  async ngOnInit() {
    await this.tasksDb.getTasks();
    this.tasksDb.subscribeToTaskChanges();
  }

  ngOnDestroy() {
    this.tasksDb.unsubscribeFromTaskChanges();
  }

}
