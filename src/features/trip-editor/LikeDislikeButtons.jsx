import { useState } from 'react';
import styles from './LikeDislikeButtons.module.css';

function LikeDislikeButtons({ onLike, onDislike }) {
  const [selected, setSelected] = useState(null);

  const handleLike = () => {
    setSelected('like');
    setTimeout(() => {
      onLike();
    }, 300);
  };

  const handleDislike = () => {
    setSelected('dislike');
    setTimeout(() => {
      onDislike();
    }, 300);
  };

  return (
    <div className={styles.container}>
      <p className={styles.question}>Ti interessa questa esperienza?</p>
      
      <div className={styles.buttonsGrid}>
        <button
          className={`${styles.button} ${styles.dislikeButton} ${
            selected === 'dislike' ? styles.selected : ''
          }`}
          onClick={handleDislike}
        >
          <span className={styles.icon}>👎</span>
          <span className={styles.text}>Non mi piace</span>
        </button>

        <button
          className={`${styles.button} ${styles.likeButton} ${
            selected === 'like' ? styles.selected : ''
          }`}
          onClick={handleLike}
        >
          <span className={styles.icon}>👍</span>
          <span className={styles.text}>Mi piace!</span>
        </button>
      </div>

      <p className={styles.hint}>
        {selected === null && '💡 Scegli per personalizzare il tuo viaggio'}
        {selected === 'like' && '✨ Perfetto! Esperienza aggiunta al viaggio'}
        {selected === 'dislike' && '🔄 Nessun problema, cercheremo alternative'}
      </p>
    </div>
  );
}

export default LikeDislikeButtons;