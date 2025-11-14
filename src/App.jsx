import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/Layout';
import Home from './features/home/Home';
import Explore from './features/explore/Explore';
import CreateWizard from './features/wizard/CreateWizard';
import TripEditor from './features/trip-editor/TripEditor';
import TimelineEditor from './features/timeline-editor/TimelineEditor';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<CreateWizard />} />
          <Route path="/trip-editor" element={<TripEditor />} />
          <Route path="/timeline-editor" element={<TimelineEditor />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;