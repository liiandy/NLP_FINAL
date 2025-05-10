import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  return (
    <AppBar position="static">
      <Toolbar>
        <RouterLink to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src="/nycu_logo.png" alt="Logo" style={{ height: 80, marginRight: 8 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '1.8rem'}}>
            CIF LAB
          </Typography>
        </RouterLink>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            首頁
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/upload"
          >
            上傳論文
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/search"
          >
            搜索論文
          </Button>
          { user ? (
            <div className="user-info" style={{ cursor: 'pointer' }}>
              <img
                src={user.avatar || localStorage.getItem('userAvatar') || '/default_avatar.png'}
                alt="Avatar"
                className="avatar"
                style={{ width: 40, height: 40, borderRadius: '50%' }}
              />
              <span>{user.name || user.username || localStorage.getItem('userName') || '使用者名稱'}</span>
            </div>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">登入</Button>
          ) }
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
