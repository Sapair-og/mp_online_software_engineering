import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import type { Task, Category, TaskPriority, TaskStatus, SubTask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'comments'> & { id?: string; comments?: any[] }) => void;
  onDelete?: (taskId: string) => void;
  task?: Task | null;
  categories: Category[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Subtasks state
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Comment addition state (local comment inputs - existing ones are read-only view)
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // Init/reset modal values when task changes or modal opens
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate);
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setCategory(categories[0]?.name || 'Work');
      setDueDate(new Date().toISOString().split('T')[0]);
      setSubtasks([]);
      setComments([]);
    }
  }, [task, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(task && { id: task.id, comments }), // pass id and existing comments back when updating
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      dueDate,
      subtasks
    });
    onClose();
  };

  // Subtask management
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(
      subtasks.map((sub) =>
        sub.id === subId ? { ...sub, isCompleted: !sub.isCompleted } : sub
      )
    );
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((sub) => sub.id !== subId));
  };

  // Comment management
  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const userStr = localStorage.getItem('tm_current_user');
    if (!userStr) return;
    const currentUser = JSON.parse(userStr);

    const newComment = {
      id: `comm-${Math.random().toString(36).substring(2, 9)}`,
      userName: currentUser.name,
      avatarColor: currentUser.avatarColor,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };

    setComments([...comments, newComment]);
    setNewCommentText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {task ? 'Edit TaskDetails' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose} 
            className="glass-btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            
            {/* Title field */}
            <div className="auth-form-group">
              <label className="auth-form-label">Task Title</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. Wireframe Dashboard Screens"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description field */}
            <div className="auth-form-group">
              <label className="auth-form-label">Description</label>
              <textarea
                className="glass-input"
                rows={3}
                placeholder="Describe what needs to be done..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            {/* Config metadata fields row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label className="auth-form-label">Status</label>
                <select
                  className="glass-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="auth-form-label">Priority</label>
                <select
                  className="glass-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="auth-form-label">Category</label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due date select */}
            <div className="auth-form-group">
              <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                className="glass-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Subtasks checklist section */}
            <div className="subtasks-section">
              <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <AlertCircle size={14} /> Checklist / Subtasks
              </label>

              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {subtasks.map((sub) => (
                    <div key={sub.id} className="subtask-item">
                      <div className="subtask-label">
                        <div 
                          className={`list-checkbox ${sub.isCompleted ? 'checked' : ''}`}
                          onClick={() => handleToggleSubtask(sub.id)}
                        >
                          {sub.isCompleted && '✓'}
                        </div>
                        <span className={sub.isCompleted ? 'subtask-text-completed' : ''}>
                          {sub.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(sub.id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Add item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  style={{ padding: '8px 12px' }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="glass-btn-secondary"
                  style={{ padding: '8px 12px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Comments logs section */}
            {task && (
              <div className="comments-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <label className="auth-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <MessageSquare size={14} /> Comments ({comments.length})
                </label>

                {comments.length > 0 && (
                  <div className="comment-list">
                    {comments.map((comm) => (
                      <div key={comm.id} className="comment-bubble">
                        <div 
                          className="comment-avatar" 
                          style={{ '--avatar-color': comm.avatarColor } as React.CSSProperties}
                        >
                          {comm.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="comment-content">
                          <div className="comment-author-meta">
                            <span className="comment-author">{comm.userName}</span>
                            <span className="comment-date">
                              {new Date(comm.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="comment-text">{comm.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="comment-input-area">
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Write a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    style={{ padding: '8px 12px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="glass-btn"
                    style={{ padding: '8px 16px' }}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="modal-footer">
            {task && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                    onClose();
                  }
                }}
                className="glass-btn-secondary"
                style={{ marginRight: 'auto', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}
            <button 
              type="button" 
              onClick={onClose} 
              className="glass-btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="glass-btn"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
