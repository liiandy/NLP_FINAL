import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { paperService } from '../services/api';
import { FiUpload } from 'react-icons/fi';
import { Box, Paper, Typography, Button } from '@mui/material';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('只支持 PDF 文件');
        setSelectedFile(null);
      } else {
        setErrorMessage(null);
        setSelectedFile(file);
      }
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return paperService.uploadPaper(file);
    },
    onSuccess: (data) => {
      navigate('/', { 
        state: { 
          newPaperId: data.id 
        } 
      });
    },
    onError: (error) => {
      setErrorMessage('上傳失敗，請重試');
      console.error('Upload error:', error);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('只支持 PDF 文件');
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: 4, width: 400, textAlign: 'center' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Typography variant="h5" gutterBottom>
          上傳論文
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          拖拉或點擊區域上傳 PDF 文件
        </Typography>
        <input
          type="file"
          accept=".pdf"
          id="file-upload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: 1,
            }}
          >
            <FiUpload size={32} />
            <Typography>選擇文件</Typography>
          </Box>
        </label>
        {selectedFile && (
          <Typography sx={{ mt: 2 }} variant="body2">
            {selectedFile.name}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? '上傳中...' : '開始上傳'}
          </Button>
        </Box>
        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}; 

export default Upload;
