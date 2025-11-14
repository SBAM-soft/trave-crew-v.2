import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './shared/Layout';
import ScrollToTop from './shared/ScrollToTop';
import Home from './features/home/Home';
import Explore from './features/explore/Explore';
import CreateWizard from './features/wizard/CreateWizard';
import TripEditor from './features/trip-editor/TripEditor';
import TimelineEditor from './features/timeline-editor/TimelineEditor';
import Profile from './features/profile/Profile';
import MyTrips from './features/my-trips/MyTrips';
import Login from './features/auth/Login';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/create" element={<CreateWizard />} />
          <Route path="/trip-editor" element={<TripEditor />} />
          <Route path="/timeline-editor" element={<TimelineEditor />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;