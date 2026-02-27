import { Component, EventEmitter, Input, Output, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  isValidTitle,
  isValidDescription,
  isValidDueDate,
  isValidCategory,
} from '../../core/utils/validation';
import { TasksDb, Task } from '../../core/db/tasks.db';
import { ContactsDb } from '../../core/db/contacts.db';
import { InputFieldComponent } from '../../shared/ui/forms/input-field/input-field';
import { ContactPicker } from '../../shared/ui/forms/contact-picker/contact-picker';
import { Button } from '../../shared/ui/button/button';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { Textarea } from '../../shared/ui/forms/textarea/textarea';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';

@Component({
  selector: 'app-task-add-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputFieldComponent,
    ContactPicker,
    Button,
    ModalWrapper,
    Textarea,
    UserFeedbackComponent,
  ],
  templateUrl: 'task-add-form.html',
  styleUrls: ['task-add-form.scss'],
})
export class TaskAddFormComponent {
  tasksDb = inject(TasksDb);
  contactsDb = inject(ContactsDb);
  cdr = inject(ChangeDetectorRef);

  @ViewChild('feedback') feedback!: UserFeedbackComponent;

  @Input() useModal = false;

  @Output() created = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isSaving = false;

  form: Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at' | 'order' | 'category'> & { category: Task['category'] | '' } = {
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    category: '',
    subtasks: [],
    status: 'todo',
    user: null,
  };

  errors: Record<string, string> = {
    title: '',
    description: '',
    due_date: '',
    category: ''
  };

  dirty: Record<string, boolean> = {
    title: false,
    description: false,
    due_date: false,
    category: false,
  };

  selectedContactIds: number[] = [];
  newSubtaskTitle = '';

  async ngOnInit() {
    await this.contactsDb.getContacts();
  }

  /**
   * Marks a specific form field as dirty and triggers validation for it.
   * Dirty fields show validation errors immediately when modified.
   * @param {keyof typeof this.dirty} field - The field to mark as dirty.
   */
  markDirty(field: keyof typeof this.form) {
    this.dirty[field] = true;
    this.validateField(field);
  }

  liveValidate(field: keyof typeof this.form) {
    if (this.dirty[field]) {
      this.validateField(field);
    }
  }

  /**
   * Validates a single form field and updates the corresponding error message.
   * Delegates validation logic to shared utility functions.
   * @param {keyof typeof this.form} field - The field to validate.
   */
  validateField(field: keyof typeof this.form) {
    const value = this.form[field] as string;

    switch (field) {
      case 'title':
        this.errors['title'] = isValidTitle(value) ? '' : 'Please enter title with max. 30 letters.';
        break;

      case 'description':
        this.errors['description'] = isValidDescription(value) ? '' : 'Please enter a description.';
        break;

      case 'due_date':
        this.errors['due_date'] = isValidDueDate(value) ? '' : 'Please enter a due date in future.';
        break;

      case 'category':
        this.errors['category'] = isValidCategory(value) ? '' : 'Please select a category.';
        break;
    }
  }

  isFormValid() {
    return (
      this.form.title.trim() !== '' &&
      this.form.due_date.trim() !== '' &&
      this.form.category.trim() !== '' &&
      !Object.values(this.errors).some((e) => e !== '')
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
      this.feedback.show('Task added to board.');
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
    for (const field of Object.keys(this.dirty) as (keyof typeof this.form)[]) {
      this.markDirty(field);
    }
  }

  private startSaving() {
    this.isSaving = true;
  }

  private async saveTask() {
    return this.tasksDb.createTask(
      this.form as Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at' | 'order'>,
      this.selectedContactIds,
    );
  }

  private handleSaveError(err: unknown) {
    console.error('Failed to create task:', err);
    this.feedback.show('Saving failed. Please check your connection or try again later.');
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
      user: null,
    };
    this.selectedContactIds = [];
    this.newSubtaskTitle = '';
    for (const key of Object.keys(this.dirty)) {
      this.dirty[key] = false;
      this.errors[key] = '';
    }
  }
}
