import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Accordion.module.css';

/**
 * Reusable Accordion component with smooth expand/collapse animations
 *
 * Features:
 * - Smooth height transitions
 * - Optional nested accordions
 * - Customizable header and content
 * - Auto-scroll to expanded content
 * - Controlled or uncontrolled mode
 *
 * Usage:
 * <Accordion
 *   title="Click to expand"
 *   isOpen={isOpen}
 *   onToggle={() => setIsOpen(!isOpen)}
 * >
 *   <div>Content here</div>
 * </Accordion>
 */
const Accordion = ({
  title,
  children,
  isOpen = false,
  onToggle,
  defaultOpen = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  icon = '▶',
  level = 1, // Accordion nesting level (1 = top level, 2 = nested, etc.)
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const accordionRef = useRef(null);

  // Use controlled or uncontrolled mode
  const isControlled = onToggle !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  // Auto-scroll to accordion when opened
  useEffect(() => {
    if (open && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [open]);

  return (
    <div
      ref={accordionRef}
      className={`${styles.accordion} ${styles[`level${level}`]} ${className}`}
      data-open={open}
    >
      {/* Header - Clickable */}
      <button
        className={`${styles.header} ${headerClassName}`}
        onClick={handleToggle}
        aria-expanded={open}
      >
        <span className={`${styles.icon} ${open ? styles.iconOpen : ''}`}>
          {icon}
        </span>
        <span className={styles.title}>{title}</span>
      </button>

      {/* Content - Expandable */}
      <div
        ref={contentRef}
        className={`${styles.content} ${contentClassName}`}
        style={{
          maxHeight: open ? `${contentRef.current?.scrollHeight}px` : '0px',
        }}
      >
        <div className={styles.contentInner}>
          {children}
        </div>
      </div>
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  defaultOpen: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  icon: PropTypes.node,
  level: PropTypes.number,
};

export default Accordion;
