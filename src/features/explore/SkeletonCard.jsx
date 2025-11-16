import { memo } from 'react';
import styles from './SkeletonCard.module.css';

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonText}></div>
        <div className={styles.skeletonText} style={{ width: '80%' }}></div>
        <div className={styles.skeletonFooter}>
          <div className={styles.skeletonBadge}></div>
          <div className={styles.skeletonBadge}></div>
        </div>
      </div>
    </div>
  );
}

export default memo(SkeletonCard);
