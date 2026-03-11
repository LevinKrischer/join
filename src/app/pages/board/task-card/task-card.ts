import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/db/tasks.db';
import { TruncatePipe } from '../../../services/truncate.pipe';

interface StatusOption {
    value: Task['status'];
    label: string;
}

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
    @Output() statusChange = new EventEmitter<{ task: Task; newStatus: Task['status'] }>();

    showMoveMenu = false;

    /**
     * Creates the task-card component instance.
     * @param elementRef Element reference for this component host.
     */
    constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

    private readonly statusOptions: StatusOption[] = [
        { value: 'todo', label: 'To Do' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'await-feedback', label: 'Await Feedback' },
        { value: 'done', label: 'Done' },
    ];

    /**
     * Returns all status options except the task's current status.
     * @returns List of selectable target statuses.
     */
    get availableStatuses(): StatusOption[] {
        return this.statusOptions.filter(option => option.value !== this.task.status);
    }

    /**
     * Toggles the move-menu visibility and prevents parent click handlers.
     * @param event Click event from the menu toggle button.
     * @returns Nothing.
     */
    toggleMoveMenu(event: Event): void {
        event.stopPropagation();
        this.showMoveMenu = !this.showMoveMenu;
    }

    /**
     * Emits a status-change request and closes the move menu.
     * @param newStatus Target status for the task.
     * @returns Nothing.
     */
    moveToStatus(newStatus: Task['status']): void {
        this.showMoveMenu = false;
        this.statusChange.emit({ task: this.task, newStatus });
    }

    /**
     * Closes the move menu when the user clicks outside menu and toggle button.
     * @param event Global document click event.
     * @returns Nothing.
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.showMoveMenu) {
            return;
        }

        const target = this.getEventTarget(event);
        if (!target) {
            return;
        }

        if (this.shouldCloseMoveMenu(target)) {
            this.showMoveMenu = false;
        }
    }

    /**
     * Extracts and normalizes the clicked HTML target element.
     * @param event Source mouse event.
     * @returns Clicked HTMLElement or null.
     */
    private getEventTarget(event: MouseEvent): HTMLElement | null {
        return event.target as HTMLElement | null;
    }

    /**
     * Evaluates whether a click target should close the move menu.
     * @param target Click target element.
     * @returns True when the click happened outside menu and toggle.
     */
    private shouldCloseMoveMenu(target: HTMLElement): boolean {
        const clickedInsideMenu = !!target.closest('.move-menu');
        const clickedToggleButton = !!target.closest('.option-btn');
        return !clickedInsideMenu && !clickedToggleButton;
    }

    /**
     * Emits the selected task to open the detail modal.
     * @returns Nothing.
     */
    onClick() {
        this.openTask.emit(this.task);
    }


    /**
     * Returns a comma-separated list of assigned contact names.
     * @returns Assigned contact names as text.
     */
    get assignedNames(): string {
        return this.task?.contacts?.map(c => c.name).join(', ') || '';
    }


    /**
     * Returns completed subtasks in done/total format.
     * @returns Progress label or empty string when no subtasks exist.
     */
    get completedSubtasks(): string {
        const total = this.task?.subtasks?.length || 0;
        if (total === 0) {
            return '';
        }
        const done = this.task.subtasks.filter(s => s.done).length;
        return `${done}/${total} Subtasks`;
    }


    /**
     * Calculates subtask completion percentage.
     * @returns Rounded progress percentage from 0 to 100.
     */
    get subtaskPercent(): number {
        const total = this.task?.subtasks?.length || 0;
        if (total === 0) {
            return 0;
        }
        const done = this.task.subtasks.filter(s => s.done).length;
        return Math.round((done / total) * 100);
    }


    /**
     * Builds initials from a full name.
     * @param name Source full name string.
     * @returns Up to two uppercase initials.
     */
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

    /**
     * Returns a normalized CSS class from the task category.
     * @returns Kebab-case category class or empty string.
     */
    getCategoryClass(): string {
        if (!this.task?.category) {
            return '';
        }
        //console.log(this.task.category.toLowerCase().replace(/\s+/g, '-'));
        return this.task.category.toLowerCase().replace(/\s+/g, '-');
    }

    /**
     * Maps the task category to a display color.
     * @returns Hex color for the current category.
     */
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
