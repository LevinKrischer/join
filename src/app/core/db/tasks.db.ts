import { Injectable, signal } from '@angular/core';
import { SupabaseClientService } from './supabase.client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Contact } from './contacts.db';

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

  constructor(private supa: SupabaseClientService) { }

  /**
   * Loads all tasks with their assigned contacts via the junction table.
   * The Supabase query joins: tasks → tasks_contacts → contacts
   */
  async getTasks() {
    const { data, error } = await this.supa.supabase
      .from('tasks')
      .select(`
        *,
        tasks_contacts (
          contacts (id, name, email, phone, color)
        )
      `)
      .order('status', { ascending: true })
      .order('order', { ascending: true }); // <-- Sortierung nach order

    if (error) {
      console.error('[Supabase] Error loading tasks:', error.message);
      return;
    }

    if (!data) return;

    const tasks: Task[] = data.map(task => ({
      ...task,
      contacts: task.tasks_contacts
        ?.map((tc: any) => tc.contacts)
        .filter(Boolean) ?? []
    }));

    this.tasks.set(tasks);
  }

  /**
   * Loads a single task by ID with assigned contacts.
   */
  async getTaskById(id: number): Promise<Task | null> {
    const { data, error } = await this.supa.supabase
      .from('tasks')
      .select(`
        *,
        tasks_contacts (
          contacts (id, name, email, phone, color)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Supabase] Error loading task:', error.message);
      return null;
    }

    return {
      ...data,
      contacts: data.tasks_contacts?.map((tc: any) => tc.contacts).filter(Boolean) ?? [],
    };
  }

  /**
   * Creates a new task and assigns contacts via the junction table.
   * @param task - Task data without id and contacts
   * @param contactIds - Array of contact IDs to assign
   */
  async createTask(
    task: Omit<Task, 'id' | 'contacts' | 'created_at' | 'modified_at' | 'order'>,
    contactIds: number[],
  ) {

    const nextOrder = await this.getNextOrderForStatus(task.status);

    const { data, error } = await this.supa.supabase
      .from('tasks')
      .insert([{ ...task, order: nextOrder }]) // <-- hier wird die nächste Order-Nummer gesetzt
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating task:', error.message);
      throw error;
    }

    if (contactIds.length > 0) {
      await this.assignContacts(data.id, contactIds);
    }

    return data;
  }

  /**
   * Updates a task and replaces its contact assignments.
   */
  async updateTask(id: number, update: Partial<Task>, contactIds?: number[]) {
    const { contacts, tasks_contacts, ...cleanUpdate } = update as any;

    const { data, error } = await this.supa.supabase
      .from('tasks')
      .update({ ...cleanUpdate, modified_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating task:', error.message);
      throw error;
    }

    if (contactIds !== undefined) {
      await this.replaceContacts(id, contactIds);
    }

    return data;
  }

  /**
   * Deletes a task. Junction table rows are removed via CASCADE.
   */
  async deleteTask(id: number) {
    const { error } = await this.supa.supabase.from('tasks').delete().eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting task:', error.message);
      throw error;
    }
  }

  /**
   * Assigns contacts to a task via the junction table.
   */
  private async assignContacts(taskId: number, contactIds: number[]) {
    const rows = contactIds.map((cId) => ({
      task_id: taskId,
      contact_id: cId,
    }));

    const { error } = await this.supa.supabase.from('tasks_contacts').insert(rows);

    if (error) {
      console.error('[Supabase] Error assigning contacts:', error.message);
      throw error;
    }
  }

  /**
   * Replaces all contact assignments for a task.
   * Deletes old assignments, then inserts new ones.
   */
  private async replaceContacts(taskId: number, contactIds: number[]) {
    await this.supa.supabase.from('tasks_contacts').delete().eq('task_id', taskId);

    if (contactIds.length > 0) {
      await this.assignContacts(taskId, contactIds);
    }
  }

  /**
   * Updates only the status of a task (for drag & drop on kanban).
   */
  async updateTaskStatus(id: number, status: Task['status']) {
    const { error } = await this.supa.supabase
      .from('tasks')
      .update({ status, modified_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error updating status:', error.message);
      throw error;
    }
  }

  async updateTaskOrder(tasks: Task[]) {
    const updates = tasks.map(t => ({
      id: t.id,
      order: t.order,
      status: t.status,
      modified_at: new Date().toISOString()
    }));

    const { error } = await this.supa.supabase
      .from('tasks')
      .upsert(updates);

    if (error) {
      console.error('[Supabase] Error updating order:', error.message);
      throw error;
    }
  }

  /**
   * NEU: Get next order number for a status column
   */
  async getNextOrderForStatus(status: Task['status']): Promise<number> {
    const { data, error } = await this.supa.supabase
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

  // ---- Realtime ----
  subscribeToTaskChanges() {
    if (this.channels) return;

    this.channels = this.supa.supabase
      .channel('tasks-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        async () => await this.getTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks_contacts' },
        async () => await this.getTasks()
      )
      .subscribe();
  }

  unsubscribeFromTaskChanges() {
    if (this.channels) {
      this.supa.supabase.removeChannel(this.channels);
    }
  }

  ngOnDestroy() {
    this.unsubscribeFromTaskChanges();
  }
}
