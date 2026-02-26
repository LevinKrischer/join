import { Component, EventEmitter, Input, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { ContactsDb } from '../../core/db/contacts.db';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { ContactPicker } from '../../shared/ui/forms/contact-picker/contact-picker';
import { Button } from '../../shared/ui/button/button';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';

@Component({
  selector: 'app-task-add-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputFieldComponent, ContactPicker, Button, ModalWrapper],
  templateUrl: 'task-add-form.html',
  styleUrls: ['task-add-form.scss'],
})
export class TaskAddFormComponent {
  tasksDb = inject(TasksDb);
  contactsDb = inject(ContactsDb);
  cdr = inject(ChangeDetectorRef);

  @Input() useModal = false;

  @Output() created = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSaving = false;
  errorMessage = '';
  successMessage = '';

  form: Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at'> = {
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: '',
    subtasks: [],
    status: 'todo',
    user: null
  };

  errors: Record<string, string> = {
    title: '',
    description: '',
    due_date: '',
    priority: '',
    category: '',
  };

  dirty: Record<string, boolean> = {
    title: false,
    description: false,
    due_date: false,
    priority: false,
    category: false,
  };

  selectedContactIds: number[] = [];
  newSubtaskTitle = '';

  async ngOnInit() {
    await this.contactsDb.getContacts();
  }

  // ---------------------------------------------------------
  // Field interaction (same pattern as contact-edit-form)
  // ---------------------------------------------------------

  markDirty(field: string) {
    this.dirty[field] = true;
    this.validateField(field);
  }

  liveValidate(field: string) {
    if (this.dirty[field]) {
      this.validateField(field);
    }
  }

  validateField(field: string) {
    // TODO: Add field-specific validation rules later
  }

  isFormValid() {
    return (
      this.form.title.trim() !== '' &&
      this.form.due_date.trim() !== '' &&
      this.form.category.trim() !== '' &&
      !Object.values(this.errors).some(e => e !== '')
    );
  }

  // ---------------------------------------------------------
  // Form-specific handlers
  // ---------------------------------------------------------

  onContactsSelected(ids: number[]) {
    this.selectedContactIds = ids;
  }

  onPrioritySelected(priority: Task['priority']) {
    this.form.priority = priority;
  }

  addSubtask() {
    const title = this.newSubtaskTitle.trim();
    if (!title) return;
    this.form.subtasks.push({ title, done: false });
    this.newSubtaskTitle = '';
  }

  removeSubtask(index: number) {
    this.form.subtasks.splice(index, 1);
  }

  onCancel() {
    this.resetForm();
    this.closed.emit();
  }

  // ---------------------------------------------------------
  // Submit flow (same pattern as contact-edit-form)
  // ---------------------------------------------------------

  async submit() {
    this.markAllDirty();
    if (!this.isFormValid()) return;

    this.startSaving();

    try {
      await this.saveTask();
      this.successMessage = 'Task created successfully.';
      this.created.emit();
      this.resetForm();
    } catch (err) {
      this.handleSaveError(err);
    } finally {
      this.finishSaving();
    }
  }

  // ---------------------------------------------------------
  // Unterfunktionen (Refactoring)
  // ---------------------------------------------------------

  private markAllDirty() {
    for (const field of Object.keys(this.dirty)) {
      this.markDirty(field);
    }
  }

  private startSaving() {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  private async saveTask() {
    return this.tasksDb.createTask(this.form, this.selectedContactIds);
  }

  private handleSaveError(err: unknown) {
    console.error('Failed to create task:', err);
    this.errorMessage = 'Saving failed. Please check your connection or try again later.';
    this.cdr.detectChanges();
  }

  private finishSaving() {
    this.isSaving = false;
  }

  private resetForm() {
    this.form = {
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      category: '',
      subtasks: [],
      status: 'todo',
      user: null
    };
    this.selectedContactIds = [];
    this.newSubtaskTitle = '';
    this.errorMessage = '';
    this.successMessage = '';
    for (const key of Object.keys(this.dirty)) {
      this.dirty[key] = false;
      this.errors[key] = false as any;
    }
  }
}
