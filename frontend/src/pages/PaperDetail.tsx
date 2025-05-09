import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paperService, type Paper, type Keyword } from '../services/api';
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{paper.title}</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">作者</h2>
        <p>{paper.authors.join(', ')}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">期刊</h2>
        <p>{paper.journal}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">年份</h2>
        <p>{paper.year}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">主題</h2>
        <p>{paper.topic?.name || '未分類'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">摘要</h2>
        <p className="whitespace-pre-wrap">{paper.abstract}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">摘要(中文)</h2>
        <p className="whitespace-pre-wrap">{paper.summary?.content || '無摘要'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">關鍵詞</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {paper.keywords.map((keyword: Keyword) => (
            <Chip
              key={keyword.id}
              label={keyword.word}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaperDetail;
