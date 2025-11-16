import { useEffect } from 'react';
import PropTypes from 'prop-types';
import usePanelStore from '../store/usePanelStore';
import styles from './PanelContainer.module.css';

/**
 * Reusable container for modal panels with stack-based z-index management
 *
 * Features:
 * - Dynamic z-index from panel store
 * - ESC key to close
 * - Click overlay to close
 * - Fade-in animation
 * - Keyboard accessibility
 *
 * Usage:
 * <PanelContainer panelId={panelId} onClose={handleClose}>
 *   <div>Panel content here</div>
 * </PanelContainer>
 */
const PanelContainer = ({ panelId, onClose, children, className = '' }) => {
  const { getZIndex, popPanel } = usePanelStore();

  const zIndex = getZIndex(panelId);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleClose = () => {
    // Call custom onClose if provided, otherwise use default popPanel
    if (onClose) {
      onClose();
    } else {
      popPanel();
    }
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not children
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      style={{ zIndex }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={`${styles.panelWrapper} ${className}`}>
        {children}
      </div>
    </div>
  );
};

PanelContainer.propTypes = {
  panelId: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default PanelContainer;
