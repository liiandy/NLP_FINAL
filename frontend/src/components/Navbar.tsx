import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(90deg,rgba(204, 240, 243, 0.2) 0%, #10131aee 100%)',
        boxShadow: '0 2px 8px 0 #0ff2',
        borderBottom: '1.5px solid #0ff2',
        borderRadius: '0 0 18px 18px',
        backdropFilter: 'blur(4px)',
        minHeight: 90,
        transition: 'background 0.4s'
      }}
      elevation={0}
    >
      <Toolbar>
        <RouterLink to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img
            src="/nycu_logo.png"
            alt="Logo"
            style={{
              height: 80,
              marginRight: 8,
              filter: 'drop-shadow(0 0 8px #0ff4)'
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 900,
              fontSize: '2.1rem',
              color: '#0ff',
              letterSpacing: '0.08em',
              textShadow: '0 0 8px #0ff4'
            }}
          >
            CIF LAB
          </Typography>
        </RouterLink>
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.02em',
              '&:hover': { color: '#0ff', background: 'rgba(0,255,255,0.08)' }
            }}
          >
            首頁
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/upload"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.02em',
              '&:hover': { color: '#0ff', background: 'rgba(0,255,255,0.08)' }
            }}
          >
            上傳論文
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/search"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.02em',
              '&:hover': { color: '#0ff', background: 'rgba(0,255,255,0.08)' }
            }}
          >
            搜索論文
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {user ? (
          <div
            className="user-info"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(16, 19, 26, 0.85)',
              borderRadius: 28,
              padding: '6px 18px',
              boxShadow: '0 0 4px #0ff2',
              border: '1px solid #0ff2',
              minHeight: 48
            }}
          >
            <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
              <img
                src="/head.jpeg"
                alt="Avatar"
                className="avatar"
                style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #0ff', boxShadow: '0 0 8px #0ff6' }}
              />
            </IconButton>
            <span style={{
              marginLeft: 12,
              color: '#0ff',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textShadow: '0 0 6px #0ff4'
            }}>
              {user.name || user.username || localStorage.getItem('userName') || '使用者名稱'}
            </span>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  background: 'rgba(0,0,0,0.95)',
                  color: '#0ff',
                  borderRadius: 2,
                  boxShadow: '0 2px 16px #0ff3'
                }
              }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: '#0ff', fontWeight: 700 }}>登出</MenuItem>
            </Menu>
          </div>
        ) : (
          <Button
            color="inherit"
            component={RouterLink}
            to="/login"
            sx={{
              color: '#fff',
              fontWeight: 700,
              letterSpacing: '0.02em',
              '&:hover': { color: '#0ff', background: 'rgba(0,255,255,0.08)' }
            }}
          >
            登入
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
