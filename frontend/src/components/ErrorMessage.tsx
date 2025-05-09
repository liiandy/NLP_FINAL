import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500 text-lg">{message}</div>
    </div>
  );
}; 