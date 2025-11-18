import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './shared/Layout';
import ScrollToTop from './shared/ScrollToTop';
import ErrorBoundary from './shared/ErrorBoundary';
import Home from './features/home/Home';
import Explore from './features/explore/Explore';
import CreateWizard from './features/wizard/CreateWizard';
import TripEditor from './features/trip-editor/TripEditor';
import TripEditorChat from './features/trip-editor-chat/TripEditorChat';
import TimelineEditor from './features/timeline-editor/TimelineEditor';
import HotelSelectionPage from './features/hotel-selection/HotelSelectionPage';
import TripSummaryUnified from './features/trip-summary/TripSummaryUnified';
import Wallet from './features/wallet/Wallet';
import Profile from './features/profile/Profile';
import MyTrips from './features/my-trips/MyTrips';
import Login from './features/auth/Login';
import './App.css';

// Configure React Query client with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - CSV data is relatively static
      cacheTime: 10 * 60 * 1000, // 10 minutes in cache
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on window focus for CSV data
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={<CreateWizard />} />
              <Route path="/trip-editor" element={<TripEditor />} />
              <Route path="/trip-editor-chat" element={<TripEditorChat />} />
              <Route path="/timeline-editor" element={<TimelineEditor />} />
              <Route path="/hotel-selection" element={<HotelSelectionPage />} />
              <Route path="/trip-summary" element={<TripSummaryUnified />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-trips" element={<MyTrips />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;