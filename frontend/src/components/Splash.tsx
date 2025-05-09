import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import './Splash.css';

interface SplashProps {
  onFinish: () => void;
}

const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Box className="splash-container">
      <Typography variant="h2" className="splash-text">
        Welcome to CIFLab
      </Typography>
    </Box>
  );
};

export default Splash;
