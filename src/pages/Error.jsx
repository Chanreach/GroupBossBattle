// Error 404
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, Home } from 'lucide-react';
import '@/index.css';
const Error = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1> 
      <p className="text-lg mb-6">There is nothing here, but us chickens.</p>
      <div className="flex space-x-4">
        <Button onClick={() => navigate(-1)} className="flex items-center">
          <ArrowLeftIcon className="mr-2" />
          Go Back
        </Button>
        <Button variant="outline" onClick={() => navigate('/')} className="flex items-center">
          <Home className="mr-2" />
          Home
        </Button>
      </div>
    </div>
  );
};

export default Error;