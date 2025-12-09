import PropTypes from 'prop-types';
import styles from './MarkdownText.module.css';

/**
 * Parser markdown leggero per messaggi chat
 * Supporta: grassetto, corsivo, liste, link, code
 */
function MarkdownText({ children }) {
  if (!children || typeof children !== 'string') {
    return <>{children}</>;
  }

  // Splitta il testo in righe per gestire liste
  const lines = children.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const parseInlineMarkdown = (text) => {
    const parts = [];
    let currentText = text;
    let key = 0;

    // Pattern per matching
    const patterns = [
      // Link [text](url)
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        render: (match, text, url) => (
          <a
            key={`link-${key++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {text}
          </a>
        )
      },
      // Grassetto **text**
      {
        regex: /\*\*([^*]+)\*\*/g,
        render: (match, text) => (
          <strong key={`bold-${key++}`} className={styles.bold}>
            {text}
          </strong>
        )
      },
      // Corsivo *text*
      {
        regex: /\*([^*]+)\*/g,
        render: (match, text) => (
          <em key={`italic-${key++}`} className={styles.italic}>
            {text}
          </em>
        )
      },
      // Code inline `code`
      {
        regex: /`([^`]+)`/g,
        render: (match, code) => (
          <code key={`code-${key++}`} className={styles.code}>
            {code}
          </code>
        )
      }
    ];

    // Processa ogni pattern
    let lastIndex = 0;
    const matches = [];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex);
      while ((match = regex.exec(currentText)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          element: pattern.render(...match)
        });
      }
    });

    // Ordina matches per indice
    matches.sort((a, b) => a.index - b.index);

    // Costruisci il risultato
    if (matches.length === 0) {
      return currentText;
    }

    matches.forEach((match, i) => {
      // Aggiungi testo prima del match
      if (match.index > lastIndex) {
        parts.push(currentText.substring(lastIndex, match.index));
      }
      // Aggiungi elemento renderizzato
      parts.push(match.element);
      lastIndex = match.index + match.length;
    });

    // Aggiungi testo rimanente
    if (lastIndex < currentText.length) {
      parts.push(currentText.substring(lastIndex));
    }

    return parts;
  };

  lines.forEach((line, index) => {
    // Lista puntata (- item o * item)
    if (line.match(/^[\-\*]\s+(.+)/)) {
      const itemText = line.replace(/^[\-\*]\s+/, '');
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(
        <li key={`li-${index}`} className={styles.listItem}>
          {parseInlineMarkdown(itemText)}
        </li>
      );
    } else {
      // Se eravamo in una lista, chiudila
      if (inList) {
        elements.push(
          <ul key={`ul-${index}`} className={styles.list}>
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      // Riga normale
      if (line.trim()) {
        elements.push(
          <p key={`p-${index}`} className={styles.paragraph}>
            {parseInlineMarkdown(line)}
          </p>
        );
      } else if (elements.length > 0) {
        // Riga vuota = spazio
        elements.push(<br key={`br-${index}`} />);
      }
    }
  });

  // Chiudi lista se necessario
  if (inList) {
    elements.push(
      <ul key="ul-final" className={styles.list}>
        {listItems}
      </ul>
    );
  }

  return <div className={styles.markdown}>{elements}</div>;
}

MarkdownText.propTypes = {
  children: PropTypes.string
};

export default MarkdownText;
