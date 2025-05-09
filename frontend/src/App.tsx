import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Search from './pages/Search';
import PaperDetail from './pages/PaperDetail';
import Splash from './components/Splash';

// 創建 QueryClient 實例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Splash + Routing handler must live inside Router to use useLocation
const AppRouter: React.FC = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // show only on first visit to '/'
    return !localStorage.getItem('splashShown') && location.pathname === '/';
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        localStorage.setItem('splashShown', 'true');
        setShowSplash(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/papers/:id" element={<PaperDetail />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRouter />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
