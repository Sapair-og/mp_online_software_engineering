import React, { useState } from 'react';
import type { User as UserType, Category } from '../types';
import { Save, User as UserIcon, Palette, FolderPlus, Trash2, ShieldAlert } from 'lucide-react';
import { updateProfile, addCategory, deleteCategory } from '../utils/mockDb';

interface SettingsViewProps {
  currentUser: UserType;
  categories: Category[];
  onProfileUpdate: (updatedUser: UserType) => void;
  onCategoriesUpdate: (updatedCats: Category[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  categories,
  onProfileUpdate,
  onCategoriesUpdate
}) => {
  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarColor, setAvatarColor] = useState(currentUser.avatarColor);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('210, 100%, 55%'); // default blue
  const [catError, setCatError] = useState<string | null>(null);

  const avatarColorsList = [
    '260, 85%, 65%', // Indigo
    '142, 70%, 45%', // Emerald
    '0, 85%, 60%',   // Coral
    '45, 95%, 50%',  // Amber
    '320, 80%, 60%', // Pink
    '200, 80%, 50%', // Sky Blue
    '280, 85%, 55%', // Purple
    '160, 80%, 40%'  // Teal
  ];

  const categoryColorsList = [
    { name: 'Red', hsl: '0, 85%, 60%' },
    { name: 'Orange', hsl: '24, 95%, 55%' },
    { name: 'Amber', hsl: '45, 95%, 50%' },
    { name: 'Emerald', hsl: '142, 70%, 45%' },
    { name: 'Teal', hsl: '160, 80%, 40%' },
    { name: 'Sky Blue', hsl: '200, 80%, 50%' },
    { name: 'Indigo', hsl: '260, 85%, 65%' },
    { name: 'Violet', hsl: '280, 85%, 55%' },
    { name: 'Pink', hsl: '320, 80%, 60%' }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    
    if (!name.trim()) {
      setProfileMsg({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    const updated = updateProfile(currentUser.id, name.trim(), bio.trim(), avatarColor);
    if (updated) {
      onProfileUpdate(updated);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg({ text: 'Error updating profile.', type: 'error' });
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);

    if (!newCatName.trim()) {
      setCatError('Category name cannot be empty.');
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setCatError('Category already exists.');
      return;
    }

    const updated = addCategory(newCatName.trim(), newCatColor);
    onCategoriesUpdate(updated);
    setNewCatName('');
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (categories.length <= 1) {
      alert('You must keep at least one category.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${catName}"? This will not delete tasks under this category, but their tag indicator will fall back to default colors.`)) {
      const updated = deleteCategory(catId);
      onCategoriesUpdate(updated);
    }
  };

  const handleResetData = () => {
    if (confirm('CAUTION: This will delete all custom tasks, categories, and logs. It will reset the database to default settings and log you out. Do you want to proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-container animate-fade-in">
      
      {/* 1. Profile Edit Card */}
      <div className="settings-card glass-panel" style={{ borderRadius: 'var(--radius-lg)' }}>
        <h3 className="settings-section-title">
          <UserIcon size={20} style={{ color: 'var(--primary-color)' }} />
          Profile Settings
        </h3>

        {profileMsg && (
          <div style={{
            background: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            color: profileMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div 
              className="user-avatar" 
              style={{ 
                '--avatar-color': avatarColor, 
                width: '70px', 
                height: '70px', 
                fontSize: '1.8rem',
                boxShadow: `0 0 20px rgba(${avatarColor}, 0.4)`
              } as React.CSSProperties}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            
            <div style={{ flex: 1 }}>
              <label className="auth-form-label">Avatar Accent Theme</label>
              <div className="avatar-color-picker">
                {avatarColorsList.map((col) => (
                  <div
                    key={col}
                    onClick={() => setAvatarColor(col)}
                    className={`color-option ${avatarColor === col ? 'selected' : ''}`}
                    style={{ backgroundColor: `rgb(${col})` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Full Name</label>
            <input
              type="text"
              className="glass-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Bio / Description</label>
            <textarea
              className="glass-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="glass-btn" style={{ alignSelf: 'flex-start' }}>
            <Save size={18} />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* 2. Custom Categories Manager */}
      <div className="settings-card glass-panel" style={{ borderRadius: 'var(--radius-lg)' }}>
        <h3 className="settings-section-title">
          <Palette size={20} style={{ color: 'var(--primary-color)' }} />
          Manage Categories
        </h3>

        {catError && (
          <div className="auth-error" style={{ marginBottom: '16px' }}>
            <span>{catError}</span>
          </div>
        )}

        {/* Existing Categories List */}
        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {categories.map((cat) => (
            <div key={cat.id} className="category-row">
              <div className="category-badge-preview">
                <span className="color-dot" style={{ backgroundColor: `rgb(${cat.color})` }} />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{cat.name}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--danger-color)',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)'
                }}
                className="glass-btn-secondary"
                title={`Delete ${cat.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="auth-form-group">
            <label className="auth-form-label">New Category Name</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. Marketing, Learning"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <button type="submit" className="glass-btn" style={{ whiteSpace: 'nowrap' }}>
                <FolderPlus size={18} />
                <span>Create Category</span>
              </button>
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Category Theme Color</label>
            <div className="avatar-color-picker">
              {categoryColorsList.map((col) => (
                <div
                  key={col.hsl}
                  onClick={() => setNewCatColor(col.hsl)}
                  className={`color-option ${newCatColor === col.hsl ? 'selected' : ''}`}
                  style={{ backgroundColor: `rgb(${col.hsl})` }}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* 3. System Actions Card */}
      <div className="settings-card glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', borderRadius: 'var(--radius-lg)' }}>
        <h3 className="settings-section-title" style={{ color: 'var(--danger-color)' }}>
          <ShieldAlert size={20} />
          Danger Zone
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Resetting the application data will wipe your session, all custom categories, local activity logs, and restore the initial seeding state.
        </p>
        <button 
          onClick={handleResetData}
          className="glass-btn" 
          style={{ background: 'var(--danger-color)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)' }}
        >
          Reset Application Database
        </button>
      </div>
    </div>
  );
};
