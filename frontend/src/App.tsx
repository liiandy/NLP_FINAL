import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Search from './pages/Search';
import PaperDetail from './pages/PaperDetail';
import Login from './pages/Login';
import Splash from './components/Splash';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRouter: React.FC = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => location.pathname === '/login');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    // 如果未登入且不是在 /login，強制跳轉到 /login
    if (!user && !isLoginPage && !showSplash) {
      navigate('/login', { replace: true });
    }
    // 如果已登入且在 /login，跳轉到 /home
    if (user && isLoginPage) {
      navigate('/home', { replace: true });
    }
  }, [user, isLoginPage, navigate, showSplash]);

  if (showSplash) {
    return <Splash onFinish={() => { setShowSplash(false); navigate('/login'); }} />;
  }

  if (!user) {
    // 未登入時，只允許 /login
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  } else {
    // 已登入時，顯示主頁面，/login 會被導向 /home
    return (
      <>
        {!isLoginPage && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/search" element={<Search />} />
          <Route path="/papers/:id" element={<PaperDetail />} />
          {/* Prevent access to /login after login */}
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </>
    );
  }
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
