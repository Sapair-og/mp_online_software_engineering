import React, { useState } from 'react';
import { Calendar, CheckSquare, MessageSquare, AlertCircle, Play, CheckCircle2, RefreshCw, Eye } from 'lucide-react';
import type { Task, Category, TaskStatus } from '../types';
import confetti from 'canvas-confetti';

interface TaskBoardProps {
  tasks: Task[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  categories,
  onTaskClick,
  onStatusChange
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: { id: TaskStatus; label: string; color: string; icon: any }[] = [
    { id: 'todo', label: 'To Do', color: 'var(--text-tertiary)', icon: AlertCircle },
    { id: 'in_progress', label: 'In Progress', color: 'var(--info-color)', icon: Play },
    { id: 'review', label: 'In Review', color: 'var(--warning-color)', icon: RefreshCw },
    { id: 'completed', label: 'Completed', color: 'var(--success-color)', icon: CheckCircle2 }
  ];

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const draggedTask = tasks.find(t => t.id === taskId);
    if (draggedTask && draggedTask.status !== targetStatus) {
      onStatusChange(taskId, targetStatus);
      
      // Celebrate with confetti if moved to completed!
      if (targetStatus === 'completed') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.75 },
          colors: ['#6366f1', '#4f46e5', '#10b981', '#34d399']
        });
      }
    }
  };

  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return cat ? cat.color : '99, 102, 241'; // fallback indigo
  };

  return (
    <div className="board-container">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`board-column ${isOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <div className="column-title">
                <span className="column-dot" style={{ backgroundColor: column.color }}></span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={16} style={{ color: column.color }} />
                  {column.label}
                </span>
              </div>
              <span className="column-count">{columnTasks.length}</span>
            </div>

            <div className="column-cards">
              {columnTasks.map((task) => {
                const completedSubtasks = task.subtasks.filter(s => s.isCompleted).length;
                const totalSubtasks = task.subtasks.length;
                const progressPct = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
                
                // Overdue calculation
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                });

                const catColor = getCategoryColor(task.category);

                return (
                  <div
                    key={task.id}
                    className="task-card glass-card animate-fade-in"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="task-card-header">
                      <span 
                        className="task-category-tag" 
                        style={{ '--tag-color': catColor } as React.CSSProperties}
                      >
                        {task.category}
                      </span>
                      <span className={`task-priority-tag ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>

                    <h4 className="task-card-title">{task.title}</h4>
                    {task.description && (
                      <p className="task-card-description">{task.description}</p>
                    )}

                    {totalSubtasks > 0 && (
                      <div className="task-card-progress">
                        <CheckSquare size={13} />
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${progressPct}%` }}
                          ></div>
                        </div>
                        <span>
                          {completedSubtasks}/{totalSubtasks}
                        </span>
                      </div>
                    )}

                    <div className="task-card-footer">
                      <div className={`task-card-due-date ${isOverdue ? 'overdue' : ''}`}>
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                      
                      <div className="task-card-meta">
                        {task.comments.length > 0 && (
                          <div className="task-card-meta-item">
                            <MessageSquare size={13} />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                        <div className="task-card-meta-item" title="Click to view details">
                          <Eye size={13} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {columnTasks.length === 0 && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8rem',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
