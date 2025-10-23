// ===== LIBRARIES ===== //
import { Loader2 } from 'lucide-react';

// ===== STYLES ===== //
import '@/index.css';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-background text-foreground p-8">
      <div className="flex items-center mb-4 flex-col">
        <Loader2 className="animate-spin h-15 w-15 mb-5" />
        <h1 className="text-4xl font-bold">Loading</h1>
      </div>
      <p className="text-lg text-center font">Please wait while we<br />prepare everything for you. :3</p><br />  
    </div>
  );
};

export default Loading;
