import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TripEditor from './features/trip-editor/TripEditor';
import './App.css';

function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🌍 Travel Crew v2.0</h1>
      <p>Benvenuto nel sistema PEXP!</p>
      <p style={{ marginTop: '1rem', color: '#6b7280' }}>
        Sistema di creazione viaggi con pacchetti esperienza
      </p>
      <Link to="/trip-editor" style={{ 
        display: 'inline-block', 
        marginTop: '2rem', 
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '0.5rem',
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
        transition: 'transform 0.2s ease'
      }}>
        🚀 Vai al Trip Editor
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip-editor" element={<TripEditor />} />
      </Routes>
    </Router>
  );
}

export default App;