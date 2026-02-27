import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/db/tasks.db';
import { TruncatePipe } from '../../../services/truncate.pipe';


@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, TruncatePipe],
    templateUrl: './task-card.html',
    styleUrls: ['./task-card.scss'],
})
export class TaskCardComponent {
    @Input() task!: Task;
    @Output() openTask = new EventEmitter<Task>();

    onClick() {
        this.openTask.emit(this.task);
    }


    @Output() open = new EventEmitter<Task>();


    get assignedNames(): string {
        return this.task?.contacts?.map(c => c.name).join(', ') || '';
    }


    get completedSubtasks(): string {
        const total = this.task?.subtasks?.length || 0;
        if (total === 0) {
            return '';
        }
        const done = this.task.subtasks.filter(s => s.done).length;
        return `${done}/${total} Subtasks`;
    }


    get subtaskPercent(): number {
        const total = this.task?.subtasks?.length || 0;
        if (total === 0) {
            return 0;
        }
        const done = this.task.subtasks.filter(s => s.done).length;
        return Math.round((done / total) * 100);
    }


    initials(name: string): string {
        if (!name) {
            return '';
        }
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }
    getCategoryClass(): string {
        if (!this.task?.category) {
            return '';
        }
        console.log(this.task.category.toLowerCase().replace(/\s+/g, '-'));
        return this.task.category.toLowerCase().replace(/\s+/g, '-');
    }

    get categoryColor(): string {
        const cat = this.task?.category?.toLowerCase() || '';
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
}
