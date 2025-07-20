import { useContext } from 'react';
import BossBattleContext from '../context/BossBattleContext';

const useBossBattle = () => {
  const context = useContext(BossBattleContext);
  
  if (!context) {
    throw new Error("useBossBattle must be used within a BossBattleProvider");
  }

  return context;
};

export default useBossBattle;
