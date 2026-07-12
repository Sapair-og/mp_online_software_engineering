import React from 'react';
import type { Task, Category, DashboardStats, ActivityLog } from '../types';
import { BarChart3, CheckCircle2, Clock, FolderHeart } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  categories: Category[];
  logs: ActivityLog[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks, categories, logs }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const review = tasks.filter(t => t.status === 'review').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
  
  // Overdue calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.dueDate < todayStr && t.status !== 'completed').length;

  const stats: DashboardStats = {
    total,
    todo,
    inProgress,
    review,
    completed,
    highPriority,
    overdue
  };

  // 1. Doughnut Chart Calculations (Priority)
  const lowCount = tasks.filter(t => t.priority === 'low').length;
  const medCount = tasks.filter(t => t.priority === 'medium').length;
  const highCount = tasks.filter(t => t.priority === 'high').length;
  const priorityTotal = lowCount + medCount + highCount || 1;

  const lowPct = lowCount / priorityTotal;
  const medPct = medCount / priorityTotal;
  const highPct = highCount / priorityTotal;

  // SVG parameters for doughnut
  const radius = 50;
  const circ = 2 * Math.PI * radius; // ~314.16

  const lowDash = lowPct * circ;
  const medDash = medPct * circ;
  const highDash = highPct * circ;

  const lowOffset = circ;
  const medOffset = circ - lowDash;
  const highOffset = circ - lowDash - medDash;

  // 2. Category Distribution (Bar Chart)
  const categoryStats = categories.map(cat => {
    const count = tasks.filter(t => t.category.toLowerCase() === cat.name.toLowerCase()).length;
    const catCompleted = tasks.filter(t => t.category.toLowerCase() === cat.name.toLowerCase() && t.status === 'completed').length;
    return {
      ...cat,
      count,
      completedCount: catCompleted,
      pct: total > 0 ? (count / total) * 100 : 0
    };
  }).sort((a, b) => b.count - a.count);

  // 3. Last 7 Days Completion Area Chart Calculations
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
      });
    }
    return result;
  };

  const last7Days = getLast7Days();
  const completionTrend = last7Days.map(day => {
    // Check completed tasks that had activity logs marking them completed on that date
    const countOnDay = logs.filter(log => {
      const logDate = log.timestamp.split('T')[0];
      return logDate === day.dateStr && (log.action.includes('completed') || log.action.includes('marked as completed'));
    }).length;
    return {
      label: day.label,
      count: countOnDay
    };
  });

  // Calculate coordinates for Area chart
  const chartHeight = 160;
  const chartWidth = 460;
  const maxVal = Math.max(...completionTrend.map(d => d.count), 4); // minimum ceiling of 4 for chart scaling
  
  const points = completionTrend.map((d, index) => {
    const x = (index / 6) * chartWidth;
    const y = chartHeight - (d.count / maxVal) * chartHeight;
    return { x, y, val: d.count };
  });

  const pathD = points.reduce((acc, p, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  const areaD = pathD + `L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Overview Stat Cards */}
      <div className="analytics-grid">
        <div className="analytics-stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)' }}>
            <BarChart3 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{stats.total}</span>
            <span className="stat-lbl">Total Tasks</span>
          </div>
        </div>

        <div className="analytics-stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{stats.completed}</span>
            <span className="stat-lbl">Completions</span>
          </div>
        </div>

        <div className="analytics-stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-val">{stats.inProgress + stats.review}</span>
            <span className="stat-lbl">In Progress / Review</span>
          </div>
        </div>

        <div className="analytics-stat-card glass-card" style={{ gridColumn: 'span 3 / span 3', display: 'flex', justifyContent: 'space-around', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger-color)' }}></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Overdue Tasks: <strong style={{ color: 'var(--danger-color)' }}>{stats.overdue}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning-color)' }}></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              High Priority Remaining: <strong style={{ color: 'var(--text-primary)' }}>{stats.highPriority}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }}></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Completion Rate: <strong style={{ color: 'var(--success-color)' }}>{total > 0 ? Math.round((completed / total) * 100) : 0}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Graphs row */}
      <div className="charts-row">
        
        {/* Completed trend area chart */}
        <div className="chart-card glass-panel">
          <span className="chart-title">Completions (Last 7 Days)</span>
          <div className="chart-content" style={{ padding: '10px 20px' }}>
            {points.length > 0 && (
              <div style={{ width: '100%' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} width="100%" height="220" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <line 
                      key={i}
                      x1="0" 
                      y1={chartHeight * ratio} 
                      x2={chartWidth} 
                      y2={chartHeight * ratio} 
                      stroke="var(--border-color)" 
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  ))}

                  {/* Area */}
                  {completed > 0 && (
                    <path d={areaD} fill="url(#areaGrad)" />
                  )}

                  {/* Line */}
                  {completed > 0 && (
                    <path d={pathD} fill="none" stroke="var(--primary-color)" strokeWidth="3" />
                  )}

                  {/* Data Dots & Tooltips */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="5" 
                        fill="var(--bg-secondary)" 
                        stroke="var(--primary-color)" 
                        strokeWidth="3" 
                      />
                      {p.val > 0 && (
                        <text 
                          x={p.x} 
                          y={p.y - 12} 
                          textAnchor="middle" 
                          fontSize="10" 
                          fontWeight="700" 
                          fill="var(--text-primary)"
                        >
                          {p.val}
                        </text>
                      )}
                      {/* X axis labels */}
                      <text 
                        x={p.x} 
                        y={chartHeight + 24} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="var(--text-secondary)"
                        fontWeight="600"
                      >
                        {completionTrend[i].label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Priority distribution doughnut chart */}
        <div className="chart-card glass-panel">
          <span className="chart-title">Tasks by Priority</span>
          <div className="chart-content">
            {total > 0 ? (
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg viewBox="0 0 120 120" width="100%" height="100%">
                  {/* Background Track */}
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="none" 
                    stroke="var(--border-color)" 
                    strokeWidth="12" 
                  />
                  {/* Low Priority segment */}
                  {lowCount > 0 && (
                    <circle 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      fill="none" 
                      stroke="var(--success-color)" 
                      strokeWidth="12" 
                      strokeDasharray={`${lowDash} ${circ}`}
                      strokeDashoffset={lowOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  )}
                  {/* Medium Priority segment */}
                  {medCount > 0 && (
                    <circle 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      fill="none" 
                      stroke="var(--warning-color)" 
                      strokeWidth="12" 
                      strokeDasharray={`${medDash} ${circ}`}
                      strokeDashoffset={medOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  )}
                  {/* High Priority segment */}
                  {highCount > 0 && (
                    <circle 
                      cx="60" 
                      cy="60" 
                      r={radius} 
                      fill="none" 
                      stroke="var(--danger-color)" 
                      strokeWidth="12" 
                      strokeDasharray={`${highDash} ${circ}`}
                      strokeDashoffset={highOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                    />
                  )}
                </svg>
                {/* Center text */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{total}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>Tasks</div>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No task data</span>
            )}
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', marginTop: '10px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger-color)' }}></span>
              <span>High ({highCount})</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning-color)' }}></span>
              <span>Medium ({medCount})</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)' }}></span>
              <span>Low ({lowCount})</span>
            </span>
          </div>
        </div>

        {/* Category distribution breakdown */}
        <div className="chart-card glass-panel" style={{ gridColumn: 'span 3 / span 3', height: 'auto', minHeight: '280px' }}>
          <span className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderHeart size={18} style={{ color: 'var(--primary-color)' }} />
            Category Task Load Breakdown
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {categoryStats.map(cat => (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="color-dot" style={{ backgroundColor: `rgb(${cat.color})` }}></span>
                    {cat.name}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {cat.count} Tasks ({cat.completedCount} completed)
                  </span>
                </div>
                <div className="progress-bar-container" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${cat.pct}%`, 
                      background: `linear-gradient(90deg, rgb(${cat.color}) 0%, rgba(${cat.color}, 0.6) 100%)` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
