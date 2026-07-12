import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  History, 
  X, 
  Activity, 
  HelpCircle
} from 'lucide-react';
import type { User, Task, Category, ActivityLog, TaskStatus } from './types';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { TaskBoard } from './components/TaskBoard';
import { TaskList } from './components/TaskList';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { 
  getCurrentUser, 
  logoutUser, 
  getTasks, 
  getCategories, 
  getLogs, 
  addTask, 
  updateTask, 
  deleteTask, 
  initializeDb 
} from './utils/mockDb';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal / Drawer Toggles
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Initialize DB and sessions
  useEffect(() => {
    initializeDb();
    const user = getCurrentUser();
    if (user) {
      handleAuthSuccess(user);
    }
    // Load categories
    setCategories(getCategories());
    
    // Load theme setting
    const savedTheme = localStorage.getItem('tm_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setTasks(getTasks(user.id));
    setLogs(getLogs(user.id));
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setTasks([]);
    setLogs([]);
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('tm_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Task operations
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'comments'> & { id?: string; comments?: any[] }) => {
    if (!currentUser) return;
    
    if (taskData.id) {
      // Edit mode
      updateTask(currentUser.id, taskData as Task);
      setTasks(getTasks(currentUser.id));
      setLogs(getLogs(currentUser.id));
    } else {
      // Add mode
      addTask(currentUser.id, taskData);
      setTasks(getTasks(currentUser.id));
      setLogs(getLogs(currentUser.id));
    }
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentUser) return;
    deleteTask(currentUser.id, taskId);
    setTasks(getTasks(currentUser.id));
    setLogs(getLogs(currentUser.id));
    setSelectedTask(null);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updated = { ...task, status: newStatus };
      updateTask(currentUser.id, updated);
      setTasks(getTasks(currentUser.id));
      setLogs(getLogs(currentUser.id));
    }
  };

  const handleTaskDateChange = (taskId: string, newDateStr: string) => {
    if (!currentUser) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updated = { ...task, dueDate: newDateStr };
      updateTask(currentUser.id, updated);
      setTasks(getTasks(currentUser.id));
      setLogs(getLogs(currentUser.id));
    }
  };

  // Filter tasks dynamically
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesPriority && matchesCategory;
  });

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {/* Main Container */}
      <main className="app-main">
        {/* Header toolbar */}
        <header className="main-header">
          
          {/* Left search */}
          <div className="header-search">
            <Search size={18} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters and Add Actions */}
          <div className="header-actions">
            
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} style={{ color: 'var(--text-tertiary)' }} />
              <select
                className="glass-input"
                style={{ padding: '8px 12px', fontSize: '0.85rem', width: '130px', cursor: 'pointer' }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <select
              className="glass-input"
              style={{ padding: '8px 12px', fontSize: '0.85rem', width: '120px', cursor: 'pointer' }}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Logs Drawer Toggler */}
            <button 
              onClick={() => setIsActivityOpen(!isActivityOpen)} 
              className="glass-btn-secondary"
              style={{ padding: '10px', borderRadius: 'var(--radius-md)' }}
              title="Activity Logs"
            >
              <History size={18} />
            </button>

            {/* Add Task Button */}
            <button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="glass-btn"
              style={{ padding: '10px 16px', fontSize: '0.9rem' }}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="main-content">
          <div className="ambient-glow" style={{ top: '10%', left: '20%' }}></div>
          <div className="ambient-glow-accent" style={{ bottom: '20%', right: '10%' }}></div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            {activeView === 'board' && (
              <TaskBoard 
                tasks={filteredTasks}
                categories={categories}
                onTaskClick={setSelectedTask}
                onStatusChange={handleStatusChange}
              />
            )}

            {activeView === 'list' && (
              <TaskList 
                tasks={filteredTasks}
                categories={categories}
                onTaskClick={setSelectedTask}
                onStatusChange={handleStatusChange}
              />
            )}

            {activeView === 'calendar' && (
              <CalendarView 
                tasks={filteredTasks}
                categories={categories}
                onTaskClick={setSelectedTask}
                onTaskDateChange={handleTaskDateChange}
              />
            )}

            {activeView === 'analytics' && (
              <AnalyticsView 
                tasks={tasks}
                categories={categories}
                logs={logs}
              />
            )}

            {activeView === 'settings' && (
              <SettingsView 
                currentUser={currentUser}
                categories={categories}
                onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
                onCategoriesUpdate={(updatedCats) => setCategories(updatedCats)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Activity Logs Slide-out Drawer Overlay */}
      {isActivityOpen && (
        <>
          <div 
            onClick={() => setIsActivityOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.1)', zIndex: 75 }}
          />
          <div className="activity-drawer glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--primary-color)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Activity History</h3>
              </div>
              <button 
                onClick={() => setIsActivityOpen(false)} 
                className="glass-btn-secondary" 
                style={{ padding: '4px', borderRadius: '50%' }}
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="activity-list">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-circle"></div>
                    <div className="activity-meta">
                      <span className="activity-desc">
                        <strong>You</strong> {log.action} <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>"{log.taskTitle}"</span>
                      </span>
                      <span className="activity-time">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '150px',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.82rem',
                  gap: '8px'
                }}>
                  <HelpCircle size={24} />
                  <span>No activities logged yet</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Task Edit/Create Modals */}
      <TaskModal 
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        categories={categories}
      />

      <TaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveTask}
        task={null}
        categories={categories}
      />
    </div>
  );
}

export default App;
