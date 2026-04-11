import React, { useEffect, useRef, useState } from 'react';
import { useStore, ContextMenuItem } from '../../store/useStore';

const ContextMenu: React.FC = () => {
  const { contextMenu, hideContextMenu } = useStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [subMenu, setSubMenu] = useState<{ items: ContextMenuItem[]; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleClick = () => { hideContextMenu(); setSubMenu(null); };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') { hideContextMenu(); setSubMenu(null); } };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('click', handleClick); window.removeEventListener('keydown', handleKeyDown); };
  }, [hideContextMenu]);

  if (!contextMenu) return null;

  const renderItems = (items: ContextMenuItem[], x: number, y: number, isSubmenu = false) => (
    <div
      ref={!isSubmenu ? menuRef : undefined}
      className="animate-scaleIn"
      style={{
        position: 'fixed',
        left: Math.min(x, window.innerWidth - 220),
        top: Math.max(4, Math.min(y, window.innerHeight - 300)),
        background: 'var(--bg-primary)',
        backdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: 8,
        border: '1px solid var(--border)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        padding: '4px 0',
        minWidth: 200,
        zIndex: 99999,
      }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />;
        }
        return (
          <div
            key={i}
            style={{
              padding: '6px 20px 6px 16px',
              fontSize: 13,
              color: item.disabled ? 'var(--text-tertiary)' : 'var(--text-primary)',
              cursor: item.disabled ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              borderRadius: 4,
              margin: '0 4px',
              position: 'relative',
            }}
            onClick={() => { if (!item.disabled && item.action) { item.action(); hideContextMenu(); } }}
            onMouseEnter={(e) => {
              if (!item.disabled) e.currentTarget.style.background = 'var(--accent)';
              if (!item.disabled) e.currentTarget.style.color = '#fff';
              if (item.submenu) {
                const rect = e.currentTarget.getBoundingClientRect();
                setSubMenu({ items: item.submenu, x: rect.right, y: rect.top });
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = item.disabled ? 'var(--text-tertiary)' : 'var(--text-primary)';
            }}
          >
            <span>{item.label}</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {item.shortcut && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.shortcut}</span>
              )}
              {item.submenu && <span style={{ fontSize: 10 }}>▸</span>}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {renderItems(contextMenu.items, contextMenu.x, contextMenu.y)}
      {subMenu && renderItems(subMenu.items, subMenu.x, subMenu.y, true)}
    </>
  );
};

export default ContextMenu;
