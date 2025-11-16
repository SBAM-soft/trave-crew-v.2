import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

function Card({
  children,
  hover = false,
  className = ''
}) {
  return (
    <div className={`${styles.card} ${hover ? styles.hover : ''} ${className}`}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool,
  className: PropTypes.string,
};

export default memo(Card);