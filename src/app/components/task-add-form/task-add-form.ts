import {
  Component,
  viewChild,
  inject,
  ChangeDetectorRef,
  input,
  output,
  effect,
  signal,
  ElementRef,
  HostListener,
} from '@angular/core';
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
import { SubtaskInputGroup } from '../../shared/ui/forms/subtask-input-group/subtask-input-group';
import { Button } from '../../shared/ui/button/button';
import { ModalWrapper } from '../../shared/ui/modal-wrapper/modal-wrapper';
import { Textarea } from '../../shared/ui/forms/textarea/textarea';
import { UserFeedbackComponent } from '../../shared/ui/user-feedback/user-feedback';
import { Select } from '../../shared/ui/forms/select/select';

@Component({
  selector: 'app-task-add-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputFieldComponent,
    ContactPicker,
    SubtaskInputGroup,
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
  elementRef = inject(ElementRef);

  feedback = viewChild.required<UserFeedbackComponent>('feedback');

  useModal = input(false);
  initialStatus = input<Task['status']>('todo');
  editTask = input<Task | null>(null);

  created = output<void>();
  updated = output<void>();
  closed = output<void>();

  isSaving = false;

  form: Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at' | 'order' | 'category'> & {
    category: Task['category'] | '';
  } = {
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
    category: '',
  };

  dirty: Record<string, boolean> = {
    title: false,
    description: false,
    due_date: false,
    category: false,
  };

  selectedContactIds: number[] = [];

  isCategoryOpen = signal(false);
  categoryOptions: { value: Task['category']; label: string }[] = [
    { value: 'Technical Task', label: 'Technical Task' },
    { value: 'User Story', label: 'User Story' },
  ];

  constructor() {
    effect(() => {
      const task = this.editTask();
      if (task) {
        this.form.title = task.title;
        this.form.description = task.description;
        this.form.due_date = task.due_date;
        this.form.priority = task.priority;
        this.form.category = task.category;
        this.form.subtasks = task.subtasks;
        this.form.status = task.status;
        this.selectedContactIds = task.contacts.map((c) => c.id);
      } else {
        this.form.status = this.initialStatus();
      }
    });
  }

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
        this.errors['title'] = isValidTitle(value)
          ? ''
          : 'Please enter title with max. 30 letters.';
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

  /**
   * Closes the category dropdown when a click occurs outside the component.
   * @param event - The document click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const categoryWrapper = this.elementRef.nativeElement.querySelector('.category-picker');
    if (categoryWrapper && !categoryWrapper.contains(target)) {
      this.isCategoryOpen.set(false);
    }
  }

  onContactsSelected(ids: number[]) {
    this.selectedContactIds = ids;
  }

  /** Opens the category dropdown. */
  openCategoryDropdown() {
    this.isCategoryOpen.set(true);
  }

  /** Selects a category and closes the dropdown. */
  selectCategory(value: Task['category']) {
    this.form.category = value;
    this.isCategoryOpen.set(false);
    this.markDirty('category');
  }

  onPrioritySelected(priority: Task['priority']) {
    this.form.priority = priority;
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

      if (!!this.editTask()) {
        this.feedback().show('Task updated.');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        this.updated.emit(); // back to detail view
      } else {
        this.feedback().show('Task added to board.');
        await new Promise((resolve) => setTimeout(resolve, 3000));
        this.created.emit();
        this.resetForm();
      }
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
    const formData = this.form as Omit<
      Task,
      'id' | 'contacts' | 'created_at' | 'modified_at' | 'order'
    >;

    if (!!this.editTask()) {
      return this.tasksDb.updateTask(this.editTask()!.id, formData, this.selectedContactIds);
    } else {
      return this.tasksDb.createTask(formData, this.selectedContactIds);
    }
  }

  private handleSaveError(err: unknown) {
    console.error('Failed to create task:', err);
    this.feedback().show('Saving failed. Please check your connection or try again later.');
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
    for (const key of Object.keys(this.dirty)) {
      this.dirty[key] = false;
      this.errors[key] = '';
    }
  }
}
