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
    <AppBar position="static">
      <Toolbar>
        <RouterLink to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src="/nycu_logo.png" alt="Logo" style={{ height: 80, marginRight: 8 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1.8rem'}}>
            CIF LAB
          </Typography>
        </RouterLink>
        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">首頁</Button>
          <Button color="inherit" component={RouterLink} to="/upload">上傳論文</Button>
          <Button color="inherit" component={RouterLink} to="/search">搜索論文</Button>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {user ? (
          <div className="user-info" style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0 }}>
              <img
                src="/head.jpeg"
                alt="Avatar"
                className="avatar"
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
            </IconButton>
            <span style={{ marginLeft: 8 }}>
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
            >
              <MenuItem onClick={handleLogout}>登出</MenuItem>
            </Menu>
          </div>
        ) : (
          <Button color="inherit" component={RouterLink} to="/login">登入</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
