import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import type { User } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  currentUser,
  onLogout,
  theme,
  onThemeToggle
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'board', label: 'Kanban Board', icon: Kanban },
    { id: 'list', label: 'Task List', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        <div className="sidebar-logo">
          <Sparkles size={24} style={{ color: 'var(--primary-color)' }} />
          <span>Taskly</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`sidebar-item glass-btn-text ${isActive ? 'active' : ''}`}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                title={item.label}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="theme-toggle-container">
          {!isCollapsed && <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Appearance</span>}
          <button 
            onClick={onThemeToggle} 
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="sidebar-user" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div 
            className="user-avatar" 
            style={{ '--avatar-color': currentUser.avatarColor } as React.CSSProperties}
            onClick={() => onViewChange('settings')}
            title="Edit Profile"
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">@{currentUser.username}</span>
          </div>
          {!isCollapsed && (
            <button 
              onClick={onLogout} 
              className="glass-btn-text" 
              style={{ marginLeft: 'auto', border: 'none', background: 'none', padding: '6px' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="glass-btn-secondary"
          style={{ padding: '6px', borderRadius: '50%', width: '30px', height: '30px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
