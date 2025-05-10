import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setError(data.detail || 'Login failed');
        } catch (err) {
          setError('Login failed: ' + text);
        }
        return;
      }

      const data = await response.json();

      // ✅ 存入登入資訊
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('isAuthenticated', 'true');

      // ✅ 可選擇存入 user 基本資訊（例如用來顯示 avatar）
      if (data.user) {
        localStorage.setItem('userName', data.user.username);
        localStorage.setItem('userAvatar', data.user.avatar || '');
      }

      // ✅ 導向首頁
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ color: '#0ff', fontWeight: 'bold' }}
          >
            LOGIN
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              variant="filled"
              fullWidth
              required
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputLabelProps={{ style: { color: '#ccc' } }}
              sx={{
                mb: 2,
                input: { color: '#fff' },
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
            <TextField
              variant="filled"
              fullWidth
              required
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{ style: { color: '#ccc' } }}
              sx={{
                mb: 3,
                input: { color: '#fff' },
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#0ff',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#0dd' },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
