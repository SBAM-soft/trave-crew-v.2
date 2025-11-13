import { useState } from 'react';
import styles from './MediaSlider.module.css';

function MediaSlider({ videoUrl, images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideo, setIsVideo] = useState(true);

  // Naviga a slide precedente
  const handlePrev = () => {
    if (isVideo) {
      setIsVideo(false);
      setCurrentIndex(images.length - 1);
    } else {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  // Naviga a slide successiva
  const handleNext = () => {
    if (isVideo) {
      setIsVideo(false);
      setCurrentIndex(0);
    } else {
      if (currentIndex === images.length - 1) {
        setIsVideo(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  // Click su dot
  const handleDotClick = (index) => {
    if (index === -1) {
      setIsVideo(true);
    } else {
      setIsVideo(false);
      setCurrentIndex(index);
    }
  };

  // Totale slide (video + immagini)
  const totalSlides = 1 + images.length;
  const currentSlide = isVideo ? 0 : currentIndex + 1;

  return (
    <div className={styles.slider}>
      {/* Counter */}
      <div className={styles.counter}>
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Contenuto */}
      <div className={styles.content}>
        {isVideo && videoUrl ? (
          <div className={styles.videoWrapper}>
            <iframe
              src={videoUrl}
              title="Video esperienza"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            />
          </div>
        ) : (
          <div className={styles.imageWrapper}>
            <img
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className={styles.image}
            />
          </div>
        )}
      </div>

      {/* Controlli navigazione */}
      <button 
        className={`${styles.navBtn} ${styles.prev}`}
        onClick={handlePrev}
        aria-label="Precedente"
      >
        ‹
      </button>

      <button 
        className={`${styles.navBtn} ${styles.next}`}
        onClick={handleNext}
        aria-label="Successivo"
      >
        ›
      </button>

      {/* Dots indicator */}
      <div className={styles.indicators}>
        {/* Video dot */}
        <button
          className={`${styles.dot} ${isVideo ? styles.active : ''}`}
          onClick={() => handleDotClick(-1)}
          aria-label="Video"
        >
          {isVideo && '▶'}
        </button>

        {/* Image dots */}
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${!isVideo && currentIndex === index ? styles.active : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Immagine ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default MediaSlider;