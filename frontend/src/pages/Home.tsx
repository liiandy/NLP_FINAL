import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { paperService } from '../services/api';
import { Spinner } from '../components/Spinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card, CardContent, Typography, Grid, Chip, Box } from '@mui/material';

const Home: React.FC = () => {
  const location = useLocation();
  const { newPaperId } = location.state || {};
  const [processingPaperId, setProcessingPaperId] = useState<number | null>(newPaperId || null);

  const { data: papers, isLoading, error } = useQuery({
    queryKey: ['papers'],
    queryFn: paperService.listPapers,
    refetchInterval: processingPaperId ? 2000 : false,
  });

  useEffect(() => {
    if (processingPaperId && papers?.find(p => p.id === processingPaperId)) {
      setProcessingPaperId(null);
    }
  }, [papers, processingPaperId]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message="無法載入論文列表" />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Typography variant="h4" gutterBottom>
        論文列表
      </Typography>
      <Grid container spacing={2}>
        {processingPaperId && (
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ height: '100%', animation: 'pulse 1.5s infinite' }}>
              <CardContent>
                <Typography variant="subtitle1" color="textSecondary">
                  處理中...
                </Typography>
                <Spinner />
              </CardContent>
            </Card>
          </Grid>
        )}
        {papers?.filter((paper) => paper.id !== processingPaperId).map((paper) => (
          <Grid item key={paper.id} xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              onClick={() => window.location.href = `/papers/${paper.id}`}
            >
              <CardContent>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    wordBreak: 'break-word',
                    whiteSpace: 'normal'
                  }}
                >
                  {paper.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {paper.journal} ({paper.year})
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {paper.keywords?.map((keyword, index) => (
                    <Chip key={index} label={keyword} size="small" color="primary" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
