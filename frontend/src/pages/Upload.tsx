import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { paperService } from '../services/api';
import { FiUpload } from 'react-icons/fi';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return paperService.uploadPaper(file);
    },
    onSuccess: () => {
      navigate('/', { 
        state: { 
          processingPaper: true,
          progress: 0 
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">上傳論文</h2>
            <p className="text-gray-600">支持 PDF 格式的論文文件</p>
          </div>

          <div className="space-y-6">
            {/* 上傳區域 */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-48 px-4 
                  transition-colors duration-150 ease-in-out border-2 border-dashed 
                  rounded-lg cursor-pointer 
                  ${selectedFile 
                    ? 'border-green-400 bg-green-50 hover:bg-green-100' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <FiUpload 
                  className={`w-12 h-12 mb-3 ${selectedFile ? 'text-green-500' : 'text-gray-400'}`} 
                />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600">已選擇文件</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedFile.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      點擊或拖放文件到這裡上傳
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      支持 PDF 格式，最大 16MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* 上傳按鈕 */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors
                  ${selectedFile && !uploadMutation.isPending
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {uploadMutation.isPending ? '上傳中...' : '開始上傳'}
              </button>
            </div>

            {/* 錯誤訊息 */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
