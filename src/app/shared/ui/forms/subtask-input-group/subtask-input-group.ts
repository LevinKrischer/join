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
    if (!this.hasEditingSubtask()) return;
    this.applySubtaskEditResult(title);
    this.cancelEditSubtask();
  }

  /**
   * Returns whether there is an active subtask edit.
   * @returns True if an editing index is active.
   */
  private hasEditingSubtask(): boolean {
    return this.editingSubtaskIndex !== null;
  }

  /**
   * Applies edited title update or deletion for active edit target.
   * @param title Trimmed edited title.
   * @returns Nothing.
   */
  private applySubtaskEditResult(title: string) {
    if (title) {
      this.emitEditedSubtasks(title);
      return;
    }

    this.removeSubtask(this.editingSubtaskIndex!);
  }

  /**
   * Emits updated subtasks with changed title for edited row.
   * @param title New subtask title.
   * @returns Nothing.
   */
  private emitEditedSubtasks(title: string) {
    const updated = this.subtasks().map((s, i) => (i === this.editingSubtaskIndex ? { ...s, title } : s));
    this.subtasksChange.emit(updated);
  }

  /**
   * Cancels subtask edit mode and clears local edit state.
   * @returns Nothing.
   */
  cancelEditSubtask() {
    this.editingSubtaskIndex = null;
    this.editingSubtaskTitle = '';
  }
}
