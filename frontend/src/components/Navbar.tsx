import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          論文管理系統
        </Typography>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 