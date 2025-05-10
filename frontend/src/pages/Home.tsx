import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { paperService } from '../services/paperService';
import type { Paper } from '../services/paperService';
import { Spinner } from '../components/Spinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Card, CardContent, Typography, Grid, Chip, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Home: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { newPaperId } = location.state || {};

  const { user } = useContext(AuthContext);
  console.log('目前 user 狀態:', user);
  const isAdmin = user?.role === 'admin';  // 判斷是否為管理員
  
  const [deletingPaperId, setDeletingPaperId] = useState<number | null>(null);
  const [processingPaperId, setProcessingPaperId] = useState<number | null>(newPaperId || null);
  const queryClient = useQueryClient();

  const { data: papers, isLoading, error } = useQuery({
    queryKey: ['papers'],
    queryFn: paperService.listPapers,
    refetchInterval: processingPaperId ? 2000 : false,
  });
  // 若 API 未回傳論文資料，則使用模擬數據以避免頁面空白
  const displayPapers = papers && papers.length > 0 ? papers : [{
    id: 1,
    title: '測試論文',
    journal: '期刊',
    year: 2025,
    keywords: ['測試'],
    uploader_name: '測試者'
  }];

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
  // 移除顯示 "沒有論文可顯示" 的檢查，直接呈現 fallback 論文

  return (
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#bde0fe', fontWeight: 700, textShadow: '0 0 8px #0ff4' }}>
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
        {displayPapers.filter((paper) => paper.id !== processingPaperId).map((paper) => (
          <Grid item key={paper.id} xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 4,
                boxShadow: '0 4px 24px 0 rgba(0,255,255,0.08)',
                border: '1.5px solid #0ff3',
                backdropFilter: 'blur(2px)',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 8px 32px 0 #0ff6' }
              }}
              onClick={() => navigate(`/papers/${paper.id}`)}
            >
              {isAdmin && (
                <IconButton
                  disabled={deletingPaperId === paper.id}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    console.log("Delete button clicked for paper:", paper.id);
                    setDeletingPaperId(paper.id);
                    paperService.deletePaper(paper.id)
                      .then(() => {
                        alert("論文已成功刪除");
                        queryClient.setQueryData(['papers'], (oldData: any = []) => oldData.filter((p: any) => p.id !== paper.id));
                        setDeletingPaperId(null);
                      })
                      .catch(error => {
                        console.error("Error deleting paper", error);
                        alert("刪除論文失敗: " + error.message);
                        setDeletingPaperId(null);
                      });
                  }}
                  sx={{ position: 'absolute', top: 5, right: 5, color: 'red', zIndex: 999 }}
                >
                  {deletingPaperId === paper.id ? <span>刪除中...</span> : <DeleteIcon />}
                </IconButton>
              )}
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: '#0ff',
                    textShadow: '0 0 8px #0ff4'
                  }}
                >
                  {paper.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 500 }}>
                  {paper.journal} ({paper.year})
                </Typography>
                {paper.uploader_name && (
                  <Typography variant="body2" sx={{ color: '#0ff', fontWeight: 500 }}>
                    上傳者: {paper.uploader_name}
                  </Typography>
                )}
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {paper.keywords?.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      size="small"
                      sx={{
                        background: 'rgba(0,255,255,0.12)',
                        color: '#0ff',
                        border: '1px solid #0ff7',
                        fontWeight: 600,
                        letterSpacing: '0.03em'
                      }}
                    />
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
