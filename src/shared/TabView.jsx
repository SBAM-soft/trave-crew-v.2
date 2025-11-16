import { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './TabView.module.css';

/**
 * TabView - Fullscreen tab component (like Chrome tabs)
 *
 * Features:
 * - Fullscreen overlay
 * - Header with title and back button
 * - Scrollable content
 * - ESC key to close
 * - z-index stacking for multiple tabs
 *
 * Usage:
 * <TabView
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Tab Title"
 *   zIndex={1000}
 * >
 *   <div>Content here</div>
 * </TabView>
 */
const TabView = ({
  isOpen,
  onClose,
  title,
  subtitle = null,
  children,
  zIndex = 1000,
  headerActions = null
}) => {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} style={{ zIndex }}>
      <div className={styles.tab}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={onClose}
            aria-label="Indietro"
          >
            ← Indietro
          </button>

          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {headerActions && (
            <div className={styles.headerActions}>
              {headerActions}
            </div>
          )}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

TabView.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
  zIndex: PropTypes.number,
  headerActions: PropTypes.node,
};

export default TabView;
