export interface SingleTask {
    id?: string;
    status: string | 'To do' | 'In progress' | 'Await feedback' | 'Done';
    title: string;
    description?: string;
    dueDate: string;
    priority: 'Urgent' | 'Medium' | 'Low';
    assigned?: string[];
    category: 'User Story' | 'Technical Task' | null;
    subtasks?: { id: string; title: string; completed: boolean }[];
    order?: number;
}
