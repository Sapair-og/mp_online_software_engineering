import type { User, Task, Category, ActivityLog, TaskStatus } from '../types';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to get dates relative to today
const getRelativeDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Work', color: '210, 100%, 55%' },      // Neon Blue
  { id: 'cat-2', name: 'Personal', color: '142, 70%, 45%' },  // Emerald Green
  { id: 'cat-3', name: 'Urgent', color: '0, 85%, 60%' },      // Coral/Red
  { id: 'cat-4', name: 'Finance', color: '45, 95%, 50%' },     // Amber/Yellow
  { id: 'cat-5', name: 'Health', color: '320, 80%, 60%' }      // Magenta/Pink
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-demo',
    username: 'demo',
    name: 'Sarah Jenkins',
    avatarColor: '260, 85%, 65%', // Indigo
    bio: 'Lead Project Coordinator & Design Enthusiast. Crafting elegant interfaces and shipping products.'
  }
];

// Helper to encrypt/hash mock passwords (just plain strings for prototype, but in localStorage)
const USER_PASSWORDS: Record<string, string> = {
  'demo': 'password'
};

const getInitialTasks = (userId: string): Task[] => [
  {
    id: 'task-1',
    userId,
    title: 'Design Brand Guidelines for Q3 Launch',
    description: 'Create a comprehensive design styleguide including HSL color palettes, typography styling scale, glow effects, glassmorphic UI variables, and dark/light mode responsive layouts.',
    status: 'review',
    priority: 'high',
    category: 'Work',
    dueDate: getRelativeDate(2),
    subtasks: [
      { id: 'sub-1', title: 'Define HSL color tokens', isCompleted: true },
      { id: 'sub-2', title: 'Establish typography scale', isCompleted: true },
      { id: 'sub-3', title: 'Write glassmorphic CSS rules', isCompleted: false },
      { id: 'sub-4', title: 'Export vector asset components', isCompleted: false }
    ],
    comments: [
      {
        id: 'comm-1',
        userName: 'Alex Rivers',
        avatarColor: '200, 80%, 50%',
        text: 'I uploaded the brand logo drafts on Figma. Take a look at the light mode contrast.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
      },
      {
        id: 'comm-2',
        userName: 'Sarah Jenkins',
        avatarColor: '260, 85%, 65%',
        text: 'Thanks Alex! Colors look vibrant. I will incorporate the feedback in the final design guidelines.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
  },
  {
    id: 'task-2',
    userId,
    title: 'Review Quarterly Financial Forecast',
    description: 'Synthesize department budgets and write a draft report summarizing expenses, projected revenue, and runway estimates.',
    status: 'todo',
    priority: 'medium',
    category: 'Finance',
    dueDate: getRelativeDate(5),
    subtasks: [
      { id: 'sub-5', title: 'Collect Q2 expense reports from team leads', isCompleted: false },
      { id: 'sub-6', title: 'Project runway under moderate growth scenario', isCompleted: false }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: 'task-3',
    userId,
    title: 'Schedule Annual Health Checkup',
    description: 'Call the dental clinic to confirm appointment slot and complete the initial patient onboarding forms.',
    status: 'completed',
    priority: 'low',
    category: 'Health',
    dueDate: getRelativeDate(-1),
    subtasks: [
      { id: 'sub-7', title: 'Call clinic reception to schedule slot', isCompleted: true },
      { id: 'sub-8', title: 'Fill pre-appointment intake forms', isCompleted: true }
    ],
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'task-4',
    userId,
    title: 'Refactor Dashboard Navigation Shell',
    description: 'Optimize responsive sidebar layout. Implement smooth transitions for mobile drawer, collapsible panels, and theme toggling with micro-animations.',
    status: 'in_progress',
    priority: 'high',
    category: 'Work',
    dueDate: getRelativeDate(1),
    subtasks: [
      { id: 'sub-9', title: 'Create CSS variables for theme variables', isCompleted: true },
      { id: 'sub-10', title: 'Implement sidebar collapse state toggler', isCompleted: true },
      { id: 'sub-11', title: 'Add slide-in mobile navigation drawer', isCompleted: false }
    ],
    comments: [
      {
        id: 'comm-3',
        userName: 'Sarah Jenkins',
        avatarColor: '260, 85%, 65%',
        text: 'The theme transitions are super smooth now! Working on mobile drawer next.',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'task-5',
    userId,
    title: 'Draft Weekly Newsletter Copy',
    description: 'Write a review of recent product features, community highlights, and update sections on upcoming webinars.',
    status: 'todo',
    priority: 'medium',
    category: 'Personal',
    dueDate: getRelativeDate(4),
    subtasks: [
      { id: 'sub-12', title: 'Write introductory paragraph', isCompleted: false },
      { id: 'sub-13', title: 'Highlight top 3 community questions', isCompleted: false },
      { id: 'sub-14', title: 'Verify social links and newsletter templates', isCompleted: false }
    ],
    comments: [],
    createdAt: new Date().toISOString()
  }
];

const getInitialLogs = (userId: string): ActivityLog[] => [
  {
    id: 'log-1',
    userId,
    taskTitle: 'Schedule Annual Health Checkup',
    action: 'marked as completed',
    timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'log-2',
    userId,
    taskTitle: 'Refactor Dashboard Navigation Shell',
    action: 'started in progress',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'log-3',
    userId,
    taskTitle: 'Design Brand Guidelines for Q3 Launch',
    action: 'submitted for review',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Initialize DB if not present
export const initializeDb = () => {
  if (!localStorage.getItem('tm_users')) {
    localStorage.setItem('tm_users', JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('tm_passwords', JSON.stringify(USER_PASSWORDS));
  }
  if (!localStorage.getItem('tm_categories')) {
    localStorage.setItem('tm_categories', JSON.stringify(DEFAULT_CATEGORIES));
  }
  // Initialize user-specific tables when they login if needed
};

// Auth Functions
export const loginUser = (username: string, password: string): User | null => {
  initializeDb();
  const users: User[] = JSON.parse(localStorage.getItem('tm_users') || '[]');
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem('tm_passwords') || '{}');
  
  const normalizedUsername = username.toLowerCase().trim();
  const user = users.find(u => u.username.toLowerCase() === normalizedUsername);
  
  if (user && passwords[user.username] === password) {
    // Seed tasks and logs if this user doesn't have any yet
    const userTasksKey = `tm_tasks_${user.id}`;
    const userLogsKey = `tm_logs_${user.id}`;
    
    if (!localStorage.getItem(userTasksKey)) {
      localStorage.setItem(userTasksKey, JSON.stringify(getInitialTasks(user.id)));
    }
    if (!localStorage.getItem(userLogsKey)) {
      localStorage.setItem(userLogsKey, JSON.stringify(getInitialLogs(user.id)));
    }
    
    localStorage.setItem('tm_current_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const registerUser = (username: string, name: string, password: string): User | null => {
  initializeDb();
  const users: User[] = JSON.parse(localStorage.getItem('tm_users') || '[]');
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem('tm_passwords') || '{}');
  
  const normalizedUsername = username.toLowerCase().trim();
  
  if (users.some(u => u.username.toLowerCase() === normalizedUsername)) {
    return null; // Username already exists
  }
  
  const newUser: User = {
    id: `user-${generateId()}`,
    username: normalizedUsername,
    name,
    avatarColor: `${Math.floor(Math.random() * 360)}, 80%, 60%`,
    bio: 'New member. Ready to organize my tasks!'
  };
  
  users.push(newUser);
  passwords[newUser.username] = password;
  
  localStorage.setItem('tm_users', JSON.stringify(users));
  localStorage.setItem('tm_passwords', JSON.stringify(passwords));
  
  // Seed with default empty tasks and templates for new users
  localStorage.setItem(`tm_tasks_${newUser.id}`, JSON.stringify(getInitialTasks(newUser.id)));
  localStorage.setItem(`tm_logs_${newUser.id}`, JSON.stringify([
    {
      id: `log-${generateId()}`,
      userId: newUser.id,
      taskTitle: 'Welcome to Taskly',
      action: 'joined the platform',
      timestamp: new Date().toISOString()
    }
  ]));
  
  localStorage.setItem('tm_current_user', JSON.stringify(newUser));
  return newUser;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('tm_current_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const logoutUser = () => {
  localStorage.removeItem('tm_current_user');
};

export const updateProfile = (userId: string, name: string, bio: string, avatarColor: string): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem('tm_users') || '[]');
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    users[userIndex] = { ...users[userIndex], name, bio, avatarColor };
    localStorage.setItem('tm_users', JSON.stringify(users));
    localStorage.setItem('tm_current_user', JSON.stringify(users[userIndex]));
    return users[userIndex];
  }
  return null;
};

// Task Functions
export const getTasks = (userId: string): Task[] => {
  return JSON.parse(localStorage.getItem(`tm_tasks_${userId}`) || '[]');
};

export const saveTasks = (userId: string, tasks: Task[]) => {
  localStorage.setItem(`tm_tasks_${userId}`, JSON.stringify(tasks));
};

export const addTask = (userId: string, taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'comments'>): Task => {
  const tasks = getTasks(userId);
  const newTask: Task = {
    ...taskData,
    id: `task-${generateId()}`,
    userId,
    comments: [],
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveTasks(userId, tasks);
  logActivity(userId, newTask.title, 'created task');
  return newTask;
};

export const updateTask = (userId: string, updatedTask: Task): Task => {
  const tasks = getTasks(userId);
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  
  if (index > -1) {
    const oldStatus = tasks[index].status;
    tasks[index] = updatedTask;
    saveTasks(userId, tasks);
    
    // Log status transitions specifically
    if (oldStatus !== updatedTask.status) {
      const statusLabels: Record<TaskStatus, string> = {
        todo: 'moved to To Do',
        in_progress: 'started working on',
        review: 'submitted for review',
        completed: 'completed task'
      };
      logActivity(userId, updatedTask.title, statusLabels[updatedTask.status] || `updated status to ${updatedTask.status}`);
    } else {
      logActivity(userId, updatedTask.title, 'updated task details');
    }
  }
  return updatedTask;
};

export const deleteTask = (userId: string, taskId: string) => {
  const tasks = getTasks(userId);
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    const filtered = tasks.filter(t => t.id !== taskId);
    saveTasks(userId, filtered);
    logActivity(userId, task.title, 'deleted task');
  }
};

// Categories
export const getCategories = (): Category[] => {
  initializeDb();
  return JSON.parse(localStorage.getItem('tm_categories') || '[]');
};

export const addCategory = (name: string, color: string): Category[] => {
  const categories = getCategories();
  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    return categories; // already exists
  }
  const newCat: Category = {
    id: `cat-${generateId()}`,
    name: name.trim(),
    color
  };
  categories.push(newCat);
  localStorage.setItem('tm_categories', JSON.stringify(categories));
  return categories;
};

export const deleteCategory = (id: string): Category[] => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  localStorage.setItem('tm_categories', JSON.stringify(filtered));
  return filtered;
};

// Activity logs
export const getLogs = (userId: string): ActivityLog[] => {
  return JSON.parse(localStorage.getItem(`tm_logs_${userId}`) || '[]');
};

export const logActivity = (userId: string, taskTitle: string, action: string) => {
  const logs = getLogs(userId);
  const newLog: ActivityLog = {
    id: `log-${generateId()}`,
    userId,
    taskTitle,
    action,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  // Keep logs list capped at 50 entries
  localStorage.setItem(`tm_logs_${userId}`, JSON.stringify(logs.slice(0, 50)));
};
