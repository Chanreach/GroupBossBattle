// ===== LIBRARIES ===== //
import { useLocation } from "react-router-dom";
import { 
  Home, 
  Info, 
  Award, 
  QrCode, 
  Sword, 
  KeyRound, 
  Trophy,
  Shield,
  Settings,
  Calendar,
  BookOpen
} from "lucide-react";

// ===== PAGE TITLE COMPONENT ===== //
export function PageTitle({ className = "text-lg font-semibold text-foreground" }) {
  const location = useLocation();
  
  // Function to get page title from pathname
  const getPageTitle = (pathname) => {
    const routes = {
      '/': 'Home',
      '/about': 'About',
      '/badges': 'Badges',
      '/leaderboard': 'Leaderboard',
      '/qr': 'QR',
      '/boss-preview': 'Boss Preview',
      '/boss-battle': 'Boss Battle',
      '/profile': 'Profile',
      '/authentication': 'Authentication',
    };
    
    // Handle nested routes
    if (pathname.includes('/boss-battle')) return 'Boss Battle';
    if (pathname.includes('/authentication')) return 'Authentication';
    if (pathname.includes('/admin')) return 'Admin Panel';
    if (pathname.includes('/host/events/view')) return 'Events';
    if (pathname.includes('/host/events/assign_boss')) return 'Events';
    if (pathname.includes('/host/events/boss_template')) return 'Events';
    if (pathname.includes('/host/events/player_badges')) return 'Bosses';
    if (pathname.includes('/host/events/player_badges/edit')) return 'Bosses';
    if (pathname.includes('/host/events/leaderboard')) return 'Bosses';
    if (pathname.includes('/host/bosses/view')) return 'Bosses';
    if (pathname.includes('/host/bosses/create')) return 'Bosses';
    if (pathname.includes('/host/bosses/edit')) return 'Bosses';
    if (pathname.includes('/host/questionbank')) return 'Question Bank';
    if (pathname.includes('/host/categories')) return 'Question Bank';
    if (pathname.includes('/host/questions')) return 'Question Bank';
    if (pathname.includes('/host/profile')) return 'Profile';
    if (pathname.includes('/host')) return 'Host Panel';
    if (pathname.includes('/leaderboard')) return 'Leaderboard';
    
    return routes[pathname] || 'UniRAID';
  };

  return (
    <h1 className={className}>
      {getPageTitle(location.pathname)}
    </h1>
  );
}

export default PageTitle;