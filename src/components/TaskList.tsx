import React from 'react';
import { Calendar, CheckSquare, Edit2, AlertCircle, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import type { Task, Category, TaskStatus } from '../types';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  onTaskClick,
  onStatusChange
}) => {
  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return cat ? cat.color : '99, 102, 241';
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <AlertCircle size={16} style={{ color: 'var(--text-tertiary)' }} />;
      case 'in_progress':
        return <Play size={16} style={{ color: 'var(--info-color)' }} />;
      case 'review':
        return <RefreshCw size={16} style={{ color: 'var(--warning-color)' }} />;
      case 'completed':
        return <CheckCircle2 size={16} style={{ color: 'var(--success-color)' }} />;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'review': return 'Review';
      case 'completed': return 'Completed';
    }
  };

  return (
    <div className="list-container animate-fade-in">
      <div className="list-row list-header-row">
        <div></div>
        <div>Title</div>
        <div>Category</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Due Date</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {tasks.length > 0 ? (
        tasks.map((task) => {
          const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
          const totalSubtasks = task.subtasks.length;
          
          const isCompleted = task.status === 'completed';
          const isOverdue = new Date(task.dueDate) < new Date() && !isCompleted;
          const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          const catColor = getCategoryColor(task.category);

          return (
            <div 
              key={task.id} 
              className="list-row glass-card"
              style={{ padding: '12px 24px', cursor: 'pointer' }}
              onClick={() => onTaskClick(task)}
            >
              {/* Checkbox toggler */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task.id, isCompleted ? 'todo' : 'completed');
                }}
                className={`list-checkbox ${isCompleted ? 'checked' : ''}`}
                title={isCompleted ? 'Mark as active' : 'Mark as completed'}
              >
                {isCompleted && '✓'}
              </div>

              {/* Title with strike-through if completed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span 
                  className="task-card-title"
                  style={{ 
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    color: isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)'
                  }}
                >
                  {task.title}
                </span>
                {totalSubtasks > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckSquare size={12} /> {completedSubtasks} of {totalSubtasks} items completed
                  </span>
                )}
              </div>

              {/* Category */}
              <div>
                <span 
                  className="task-category-tag"
                  style={{ '--tag-color': catColor } as React.CSSProperties}
                >
                  {task.category}
                </span>
              </div>

              {/* Priority */}
              <div>
                <span className={`task-priority-tag ${task.priority}`}>
                  {task.priority}
                </span>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                {getStatusIcon(task.status)}
                <span style={{ color: 'var(--text-secondary)' }}>{getStatusLabel(task.status)}</span>
              </div>

              {/* Due date */}
              <div 
                className={isOverdue ? 'overdue' : ''} 
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)' }}
              >
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  className="glass-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
                >
                  <Edit2 size={12} />
                  <span style={{ marginLeft: '4px' }}>Edit</span>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-tertiary)'
        }}>
          No tasks found matching your filters.
        </div>
      )}
    </div>
  );
};
