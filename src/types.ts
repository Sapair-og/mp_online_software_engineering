export interface User {
  id: string;
  username: string;
  name: string;
  avatarColor: string; // HSL color or hex
  bio?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskComment {
  id: string;
  userName: string;
  avatarColor: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string; // matches Category name
  dueDate: string; // YYYY-MM-DD
  subtasks: SubTask[];
  comments: TaskComment[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // HSL code e.g. "210, 100%, 50%" or hex
}

export interface ActivityLog {
  id: string;
  userId: string;
  taskTitle: string;
  action: string; // e.g. "created task", "marked task as completed"
  timestamp: string;
}

export interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  completed: number;
  highPriority: number;
  overdue: number;
}
