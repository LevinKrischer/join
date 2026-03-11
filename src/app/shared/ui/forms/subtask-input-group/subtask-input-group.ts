import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subtask } from '../../../../core/db/tasks.db';

@Component({
  selector: 'app-subtask-input-group',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './subtask-input-group.html',
  styleUrl: './subtask-input-group.scss',
})
export class SubtaskInputGroup {
  subtasks = input<Subtask[]>([]);
  subtasksChange = output<Subtask[]>();

  newSubtaskTitle = '';
  editingSubtaskIndex: number | null = null;
  editingSubtaskTitle = '';

  /**
   * Adds a new subtask from current input title.
   * @returns Nothing.
   */
  addSubtask() {
    const title = this.newSubtaskTitle.trim();
    if (!title) return;
    const updated = [...this.subtasks(), { title, done: false }];
    this.subtasksChange.emit(updated);
    this.newSubtaskTitle = '';
  }

  /**
   * Removes a subtask by array index.
   * @param index Subtask index to remove.
   * @returns Nothing.
   */
  removeSubtask(index: number) {
    const updated = this.subtasks().filter((_, i) => i !== index);
    this.subtasksChange.emit(updated);
  }

  /**
   * Starts edit mode for a selected subtask.
   * @param index Subtask index to edit.
   * @returns Nothing.
   */
  editSubtask(index: number) {
    this.editingSubtaskIndex = index;
    this.editingSubtaskTitle = this.subtasks()[index].title;
  }

  /**
   * Confirms current subtask edit or removes empty-titled subtask.
   * @returns Nothing.
   */
  confirmEditSubtask() {
    const title = this.editingSubtaskTitle.trim();
    if (this.editingSubtaskIndex !== null) {
      if (title) {
        const updated = this.subtasks().map((s, i) =>
          i === this.editingSubtaskIndex ? { ...s, title } : s
        );
        this.subtasksChange.emit(updated);
      } else {
        this.removeSubtask(this.editingSubtaskIndex);
      }
    }
    this.cancelEditSubtask();
  }

  cancelEditSubtask() {
    this.editingSubtaskIndex = null;
    this.editingSubtaskTitle = '';
  }
}
