import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Contact } from './contacts.db';

const TASKS_WITH_CONTACTS_SELECT = `
  *,
  tasks_contacts (
    contacts (id, name, email, phone, color)
  )
`;

export interface Subtask {
  title: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'urgent' | 'medium' | 'low';
  category: 'Technical Task' | 'User Story';
  subtasks: Subtask[];
  status: 'todo' | 'in-progress' | 'await-feedback' | 'done';
  order: number;
  created_at: string;
  modified_at: string | null;
  user: string | null;
  contacts: Contact[];
}

@Injectable({ providedIn: 'root' })
export class TasksDb {
  tasks = signal<Task[]>([]);
  channels: RealtimeChannel | null = null;

  /**
   * Creates the tasks database service.
   * @param supa Shared Supabase service instance.
   */
  constructor(private supa: SupabaseService) {}

  /**
   * Loads all tasks with their assigned contacts via the junction table.
   * The Supabase query joins: tasks → tasks_contacts → contacts
   * @returns Promise that resolves when task state was updated.
   */
  async getTasks() {
    const { data, error } = await this.fetchTasksWithContacts();
    if (this.hasTasksLoadError(error)) {
      return;
    }

    this.tasks.set(this.mapTaskRows(data));
  }

  /**
   * Fetches tasks with contacts relation ordered by status and order.
   * @returns Promise containing Supabase query result.
   */
  private fetchTasksWithContacts() {
    return this.supa.client
      .from('tasks')
      .select(TASKS_WITH_CONTACTS_SELECT)
      .order('status', { ascending: true })
      .order('order', { ascending: true });
  }

  /**
   * Handles task-load query errors.
   * @param error Potential Supabase error response.
   * @returns True when execution should stop due to error.
   */
  private hasTasksLoadError(error: { message: string } | null): boolean {
    if (!error) {
      return false;
    }

    console.error('[Supabase] Error loading tasks:', error.message);
    return true;
  }

  /**
   * Maps raw task rows from Supabase into Task models.
   * @param data Raw query data array.
   * @returns Normalized task array.
   */
  private mapTaskRows(data: any[] | null): Task[] {
    if (!data) {
      return [];
    }

    return data.map((task) => this.mapTaskRow(task));
  }

  /**
   * Maps one raw task row from Supabase into a Task model.
   * @param task Raw task row with joined contacts relation.
   * @returns Normalized task object.
   */
  private mapTaskRow(task: any): Task {
    return {
      ...task,
      contacts: task.tasks_contacts?.map((tc: any) => tc.contacts).filter(Boolean) ?? [],
    };
  }

  /**
   * Loads a single task by ID with assigned contacts.
   * @param id Task ID.
   * @returns Promise with task data or null.
   */
  async getTaskById(id: number): Promise<Task | null> {
    const { data, error } = await this.fetchTaskByIdWithContacts(id);
    if (this.hasSingleTaskLoadError(error)) {
      return null;
    }

    return this.mapTaskRow(data);
  }

  /**
   * Fetches one task row including assigned contacts by task ID.
   * @param id Task ID.
   * @returns Promise containing Supabase query result.
   */
  private fetchTaskByIdWithContacts(id: number) {
    return this.supa.client.from('tasks').select(TASKS_WITH_CONTACTS_SELECT).eq('id', id).single();
  }

  /**
   * Handles single-task load errors.
   * @param error Potential Supabase error response.
   * @returns True when execution should stop due to error.
   */
  private hasSingleTaskLoadError(error: { message: string } | null): boolean {
    if (!error) {
      return false;
    }

    console.error('[Supabase] Error loading task:', error.message);
    return true;
  }

  /**
   * Creates a new task and assigns contacts via the junction table.
   * @param task Task data without id and contacts.
   * @param contactIds Array of contact IDs to assign.
   * @returns Promise with created task row.
   */
  async createTask(
    task: Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at' | 'order'>,
    contactIds: number[],
  ) {
    const nextOrder = await this.getNextOrderForStatus(task.status);
    const data = await this.insertTask(task, nextOrder);
    await this.assignContactsIfProvided(data.id, contactIds);
    return data;
  }

  /**
   * Inserts a new task row with a predefined order.
   * @param task Task payload without id/contacts/order timestamps.
   * @param nextOrder Computed next order index in status column.
   * @returns Promise with inserted task row.
   * @throws If the insert operation fails.
   */
  private async insertTask(
    task: Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at' | 'order'>,
    nextOrder: number,
  ) {
    const { data, error } = await this.supa.client.from('tasks').insert([{ ...task, order: nextOrder }]).select().single();
    if (error) {
      console.error('[Supabase] Error creating task:', error.message);
      throw error;
    }

    return data;
  }

  /**
   * Assigns contacts to a created task when contact IDs are present.
   * @param taskId ID of the created task.
   * @param contactIds Contact IDs to assign.
   * @returns Promise that resolves after assignment.
   */
  private async assignContactsIfProvided(taskId: number, contactIds: number[]) {
    if (contactIds.length > 0) {
      await this.assignContacts(taskId, contactIds);
    }
  }

  /**
   * Updates a task and replaces its contact assignments.
   * @param id Task ID to update.
   * @param update Partial task payload.
   * @param contactIds Optional replacement contact IDs.
   * @returns Promise with updated task rows.
   */
  async updateTask(id: number, update: Partial<Task>, contactIds?: number[]) {
    const cleanUpdate = this.removeNonPersistedTaskFields(update);
    const data = await this.persistTaskUpdate(id, cleanUpdate);
    await this.replaceContactsIfProvided(id, contactIds);
    return data;
  }

  /**
   * Removes relation-only task fields before persistence.
   * @param update Partial task payload.
   * @returns Sanitized update payload for tasks table.
   */
  private removeNonPersistedTaskFields(update: Partial<Task>) {
    const { contacts, tasks_contacts, ...cleanUpdate } = update as any;
    return cleanUpdate;
  }

  /**
   * Persists task changes and updates modified timestamp.
   * @param id Task ID to update.
   * @param cleanUpdate Sanitized task update payload.
   * @returns Promise with updated task rows.
   * @throws If the update operation fails.
   */
  private async persistTaskUpdate(id: number, cleanUpdate: Partial<Task>) {
    const { data, error } = await this.supa.client
      .from('tasks')
      .update({ ...cleanUpdate, modified_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating task:', error.message);
      throw error;
    }

    return data;
  }

  /**
   * Replaces task-contact assignments only when values are provided.
   * @param id Task ID whose contacts should be replaced.
   * @param contactIds Optional replacement contact IDs.
   * @returns Promise that resolves after replacement.
   */
  private async replaceContactsIfProvided(id: number, contactIds?: number[]) {
    if (contactIds !== undefined) {
      await this.replaceContacts(id, contactIds);
    }
  }

  /**
   * Deletes a task within Junction tbl tsks_contacts
   * and cascades it to tbl tasks.
   * @param id Task ID to delete.
   * @returns Promise that resolves after deletion.
   */
  async deleteTask(id: number) {
    await this.deleteTaskById(id);
  }

  /**
   * Deletes one task row by its ID.
   * @param id Task ID to delete.
   * @returns Promise that resolves after deletion.
   * @throws If the delete operation fails.
   */
  private async deleteTaskById(id: number) {
    const { error } = await this.supa.client.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] Error deleting task:', error.message);
      throw error;
    }
  }

  /**
   * Assigns contacts to a task via the junction table.
   * @param taskId Task ID to assign contacts for.
   * @param contactIds Contact IDs to assign.
   * @returns Promise that resolves after assignment.
   * @throws If the insert operation fails.
   */
  private async assignContacts(taskId: number, contactIds: number[]) {
    const rows = contactIds.map((cId) => ({
      task_id: taskId,
      contact_id: cId,
    }));

    const { error } = await this.supa.client.from('tasks_contacts').insert(rows);

    if (error) {
      console.error('[Supabase] Error assigning contacts:', error.message);
      throw error;
    }
  }

  /**
   * Replaces all contact assignments for a task.
   * Deletes old assignments, then inserts new ones.
   * @param taskId Task ID to update assignments for.
   * @param contactIds Contact IDs to assign.
   * @returns Promise that resolves after replacement.
   */
  private async replaceContacts(taskId: number, contactIds: number[]) {
    await this.supa.client.from('tasks_contacts').delete().eq('task_id', taskId);

    if (contactIds.length > 0) {
      await this.assignContacts(taskId, contactIds);
    }
  }

  /**
   * Updates only the status of a task (for drag & drop on kanban).
    * @param id Task ID to update.
    * @param status New task status.
    * @returns Promise that resolves after status update.
    * @throws If the update operation fails.
   */
  async updateTaskStatus(id: number, status: Task['status']) {
    const { error } = await this.supa.client
      .from('tasks')
      .update({ status, modified_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating status:', error.message);
      throw error;
    }
  }

  /**
   * Persists order and status updates for multiple tasks.
   * @param tasks Tasks with desired order and status.
   * @returns Promise that resolves after upsert.
   * @throws If the upsert operation fails.
   */
  async updateTaskOrder(tasks: Task[]) {
    const updates = this.buildTaskOrderUpdates(tasks);
    const { error } = await this.supa.client.from('tasks').upsert(updates);

    if (error) {
      console.error('[Supabase] Error updating order:', error.message);
      throw error;
    }
  }

  /**
   * Builds payload for bulk task order upsert.
   * @param tasks Tasks to map for upsert.
   * @returns Upsert payload array.
   */
  private buildTaskOrderUpdates(tasks: Task[]) {
    return tasks.map((t) => ({
      id: t.id,
      order: t.order,
      status: t.status,
      modified_at: new Date().toISOString(),
    }));
  }

  /**
   * Gets the next order number for a status column.
   * @param status Status column to inspect.
   * @returns Promise with next order index.
   */
  async getNextOrderForStatus(status: Task['status']): Promise<number> {
    const { data, error } = await this.supa.client
      .from('tasks')
      .select('order')
      .eq('status', status)
      .order('order', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[Supabase] Error loading max order:', error.message);
      return 0;
    }

    return data?.[0]?.order + 1 || 0;
  }

  /**
   * Subscribes to realtime changes for tasks and task-contact assignments.
   * @returns Nothing.
   */
  subscribeToTaskChanges() {
    if (this.channels) return;

    this.channels = this.createTaskRealtimeChannel();
  }

  /**
   * Creates and subscribes the realtime channel used for task reloads.
   * @returns Active realtime channel.
   */
  private createTaskRealtimeChannel(): RealtimeChannel {
    const channel = this.supa.client.channel('tasks-channel');
    this.registerTaskRealtimeListeners(channel);
    return channel.subscribe();
  }

  /**
   * Registers realtime listeners for task-related tables.
   * @param channel Channel where listeners should be attached.
   * @returns Nothing.
   */
  private registerTaskRealtimeListeners(channel: RealtimeChannel) {
    this.registerRealtimeListener(channel, 'tasks');
    this.registerRealtimeListener(channel, 'tasks_contacts');
  }

  /**
   * Registers one realtime listener for a table.
   * @param channel Channel where listener should be attached.
   * @param table Database table name to listen on.
   * @returns Nothing.
   */
  private registerRealtimeListener(channel: RealtimeChannel, table: 'tasks' | 'tasks_contacts') {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, async () => this.handleRealtimeTaskChange());
  }

  /**
   * Handles realtime task related changes by reloading tasks.
   * @returns Promise that resolves after reload.
   */
  private async handleRealtimeTaskChange() {
    await this.getTasks();
  }

  /**
   * Unsubscribes from realtime task channel.
   * @returns Nothing.
   */
  unsubscribeFromTaskChanges() {
    if (this.channels) {
      this.supa.client.removeChannel(this.channels);
      this.channels = null;
    }
  }

  /**
   * Cleans up realtime subscriptions when service is destroyed.
   * @returns Nothing.
   */
  ngOnDestroy() {
    this.unsubscribeFromTaskChanges();
  }
}
