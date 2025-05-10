import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paperService, type Paper } from '../services/paperService';
import { Spinner } from '../components/Spinner';
import { ErrorMessage } from '../components/ErrorMessage';
import Chip from '@mui/material/Chip';

const PaperDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log('Paper ID from URL:', id);

  const { data: paper, isLoading, error } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => {
      console.log('Fetching paper with ID:', id);
      return paperService.getPaper(Number(id));
    },
  });

  console.log('Query state:', { isLoading, error, paper });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    console.error('Error loading paper:', error);
    return <ErrorMessage message="無法載入論文詳情" />;
  }

  if (!paper) {
    return <ErrorMessage message="找不到論文" />;
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      padding: '32px 32px 24px 32px',
      background: 'rgba(255,255,255,0.07)',
      borderRadius: 16,
      boxShadow: '0 8px 40px 0 rgba(0,255,255,0.10)',
      border: '1.5px solid #0ff3',
      backdropFilter: 'blur(2px)'
    }}>
      <h1
        style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          color: '#0ff',
          marginBottom: 18,
          textShadow: '0 0 12px #0ff6'
        }}
      >
        {paper.title}
      </h1>
      {(paper.uploader_name || paper.created_at) && (
        <div style={{ marginBottom: 18, color: '#0ff', fontWeight: 500, fontSize: 15 }}>
          {paper.uploader_name && <span>上傳者: {paper.uploader_name}</span>}
          {paper.uploader_name && paper.created_at && <span>　|　</span>}
          {paper.created_at && <span>上傳時間: {new Date(paper.created_at).toLocaleString()}</span>}
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>作者</h2>
        <p style={{ color: '#fff', fontWeight: 500 }}>{paper.authors.join(', ')}</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>期刊</h2>
        <p style={{ color: '#aaa', fontWeight: 500 }}>{paper.journal}</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>年份</h2>
        <p style={{ color: '#aaa', fontWeight: 500 }}>{paper.year}</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>主題</h2>
        <p style={{ color: '#fff', fontWeight: 500 }}>
          {paper.topic
            ? typeof paper.topic === 'object'
              ? paper.topic.name
              : paper.topic
            : '未分類'}
        </p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>摘要</h2>
        <p style={{ color: '#fff', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{paper.abstract}</p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>摘要(中文)</h2>
        <p style={{ color: '#fff', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
          {paper.summary
            ? typeof paper.summary === 'object'
              ? paper.summary.content
              : paper.summary
            : '無摘要'}
        </p>
      </div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0ff', marginBottom: 6 }}>關鍵詞</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {paper.keywords.map((keyword: any) => (
            <Chip
              key={keyword.id || keyword}
              label={keyword.word || keyword}
              size="small"
              sx={{
                background: 'rgba(0,255,255,0.12)',
                color: '#0ff',
                border: '1px solid #0ff7',
                fontWeight: 600,
                letterSpacing: '0.03em'
              }}
              variant="outlined"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;
