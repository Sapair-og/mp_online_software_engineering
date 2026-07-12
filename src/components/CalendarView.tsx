import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Task, Category } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  onTaskClick: (task: Task) => void;
  onTaskDateChange: (taskId: string, newDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  categories,
  onTaskClick,
  onTaskDateChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
    return cat ? cat.color : '99, 102, 241';
  };

  // Generate calendar days grid
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon, etc.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];

    // Previous month padding days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dayNum: prevDate.getDate(),
        dateStr: prevDate.toISOString().split('T')[0]
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currDate = new Date(year, month, i);
      // Ensure local timezone offsets don't wrap date
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: currDate,
        isCurrentMonth: true,
        dayNum: i,
        dateStr
      });
    }

    // Next month padding days to complete grid (multiples of 7, let's say 42 cells total)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dayNum: i,
        dateStr
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    onTaskDateChange(taskId, targetDateStr);
  };

  const isToday = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr === todayStr;
  };

  return (
    <div className="calendar-container animate-fade-in">
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={22} style={{ color: 'var(--primary-color)' }} />
          <h2 className="calendar-title">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="calendar-nav">
          <button onClick={handlePrevMonth} className="glass-btn-secondary" style={{ padding: '8px' }}>
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="glass-btn-secondary" 
            style={{ fontSize: '0.85rem', fontWeight: 600 }}
          >
            Today
          </button>
          <button onClick={handleNextMonth} className="glass-btn-secondary" style={{ padding: '8px' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="calendar-grid" style={{ marginBottom: '8px' }}>
        {weekDays.map(day => (
          <div key={day} className="calendar-day-label">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-grid">
        {calendarDays.map((cell, index) => {
          const cellTasks = tasks.filter(t => t.dueDate === cell.dateStr);
          const cellIsToday = isToday(cell.dateStr);

          return (
            <div
              key={index}
              className={`calendar-cell ${!cell.isCurrentMonth ? 'outside' : ''} ${cellIsToday ? 'today' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, cell.dateStr)}
            >
              <div className="calendar-cell-header">
                {cellIsToday ? (
                  <span className="calendar-today-indicator">{cell.dayNum}</span>
                ) : (
                  <span className="calendar-day-num">{cell.dayNum}</span>
                )}
              </div>

              <div className="calendar-tasks">
                {cellTasks.map(task => {
                  const catColor = getCategoryColor(task.category);
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className="calendar-task-pill"
                      style={{ 
                        '--tag-color': catColor,
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.6 : 1
                      } as React.CSSProperties}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      title={`${task.title} (${task.category})`}
                    >
                      {task.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
