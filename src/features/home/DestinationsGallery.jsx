import { Link } from 'react-router-dom';
import Card from '../../shared/Card';
import styles from './DestinationsGallery.module.css';

function DestinationsGallery() {
  const destinazioni = [
    {
      id: 1,
      nome: 'Thailandia',
      emoji: '🇹🇭',
      immagine: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
      descrizione: 'Templi, spiagge paradisiache',
      viaggi: 12
    },
    {
      id: 2,
      nome: 'Grecia',
      emoji: '🇬🇷',
      immagine: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600',
      descrizione: 'Isole da sogno e storia antica',
      viaggi: 8
    },
    {
      id: 3,
      nome: 'Cuba',
      emoji: '🇨🇺',
      immagine: 'https://images.unsplash.com/photo-1489880602311-7c63d2d5cfd9?w=600',
      descrizione: 'Musica e spiagge caraibiche',
      viaggi: 5
    },
    {
      id: 4,
      nome: 'Marocco',
      emoji: '🇲🇦',
      immagine: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600',
      descrizione: 'Deserti e medine affascinanti',
      viaggi: 7
    },
    {
      id: 5,
      nome: 'Spagna',
      emoji: '🇪🇸',
      immagine: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=600',
      descrizione: 'Arte, tapas e movida',
      viaggi: 15
    },
    {
      id: 6,
      nome: 'Giappone',
      emoji: '🇯🇵',
      immagine: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
      descrizione: 'Tradizione e tecnologia',
      viaggi: 9
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Esplora le destinazioni</h2>
          <p className={styles.subtitle}>6 paesi incredibili ti aspettano</p>
        </div>

        <div className={styles.grid}>
          {destinazioni.map(dest => (
            <Card key={dest.id} hover className={styles.card}>
              <div className={styles.imageContainer}>
                <img 
                  src={dest.immagine}
                  alt={dest.nome}
                  className={styles.image}
                />
                <div className={styles.imageOverlay} />
                
                <div className={styles.badge}>
                  {dest.viaggi} viaggi
                </div>
                
                <div className={styles.nameContainer}>
                  <h3 className={styles.name}>
                    <span>{dest.emoji}</span>
                    <span>{dest.nome}</span>
                  </h3>
                </div>
              </div>

              <div className={styles.content}>
                <p className={styles.description}>{dest.descrizione}</p>
                <Link to={`/explore?dest=${dest.id}`} className={styles.link}>
                  Scopri i viaggi
                  <span>→</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className={styles.footer}>
          <Link to="/explore">
            <button className={styles.viewAllButton}>
              Vedi tutti i viaggi
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DestinationsGallery;