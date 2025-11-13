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

export default Card;