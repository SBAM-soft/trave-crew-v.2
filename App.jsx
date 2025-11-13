import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 🆕 IMPORT PROVIDER PACCHETTI
import { PackageProvider } from './context/PackageContext';
// Fine import nuovo
import Layout from './components/layout/Layout';
import Home from './components/home/Home';
import Explore from './components/explore/Explore';
import CreateWizard from './components/wizard/CreateWizard';
import TripEditor from './components/editor/TripEditor';

function App() {
  return (
    // 🆕 WRAPPA TUTTO CON PACKAGEPROVIDER
    <PackageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            
            {/* Wizard Creazione */}
            <Route path="/create" element={<CreateWizard />} />
            <Route path="/trip-editor" element={<TripEditor />} />
            
            {/* Placeholder altre route */}
            <Route path="/my-trips" element={<div style={{ padding: '5rem', textAlign: 'center' }}>🎒 I miei viaggi - Coming soon</div>} />
            <Route path="/community" element={<div style={{ padding: '5rem', textAlign: 'center' }}>💬 Community - Coming soon</div>} />
          </Routes>
        </Layout>
      </Router>
    </PackageProvider>
  );
}

export default App;