// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { apiClient } from '@/api';

const EventCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/events');
        const eventsData = response.data || [];
        
        // Format events for the carousel
        const formattedEvents = eventsData.map(event => ({
          id: event.id,
          name: event.name,
          title: "Interactive Boss Battle Experience",
          description: event.description || "Join forces with other participants and put your knowledge to the test! Answer questions, deal damage, and work together to defeat powerful bosses.",
          startTime: event.startTimeFormatted?.formatted || 'TBD',
          endTime: event.endTimeFormatted?.formatted || 'TBD',
          image: "/src/assets/Swords.png",
          isActive: event.status === 'active' || event.status === 'ongoing',
          status: event.status || 'upcoming'
        }));
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err);
        // Set placeholder events if fetch fails
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Placeholder event for when no events exist
  const placeholderEvents = [
    {
      id: 'placeholder-1',
      name: "No Events Scheduled",
      title: "Stay Tuned for Epic Battles",
      description: "Amazing boss battle events are being planned! Check back soon for exciting interactive experiences where you can team up with others to defeat powerful bosses.",
      startTime: "Coming Soon",
      endTime: "Stay Tuned",
      image: "/src/assets/Swords.png",
      isActive: false,
      status: 'coming-soon',
      isPlaceholder: true
    }
  ];

  // Use placeholder if no events or loading failed
  const displayEvents = events.length > 0 ? events : placeholderEvents;

  // Auto-advance carousel
  useEffect(() => {
    if (displayEvents.length <= 1) return; // Don't auto-advance if only one event/placeholder
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === displayEvents.length - 1 ? 0 : prevIndex + 1
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [displayEvents.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? displayEvents.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === displayEvents.length - 1 ? 0 : currentIndex + 1);
  };

  const handleCardClick = (event) => {
    // Don't navigate if it's a placeholder event
    if (event.isPlaceholder) {
      return;
    }
    
    // Navigate to event-bosses page with the event ID
    navigate(`/event-bosses?eventId=${event.id}`);
  };

  const getCardPosition = (index) => {
    const diff = index - currentIndex;
    
    if (diff === 0) {
      // Center card
      return "translate-x-[-50%] translate-y-[-50%] z-10 scale-100 brightness-100";
    } else if (diff === -1 || (diff === displayEvents.length - 1)) {
      // Left card - closer to center on mobile
      return "translate-x-[-66%] sm:translate-x-[-80%] translate-y-[-50%] scale-75 brightness-[.4]";
    } else if (diff === 1 || (diff === -(displayEvents.length - 1))) {
      // Right card - closer to center on mobile
      return "translate-x-[-34%] sm:translate-x-[-20%] translate-y-[-50%] scale-75 brightness-[.4]";
    } else {
      // Hidden cards - closer to center on mobile
      return "translate-x-[-35%] sm:translate-x-[-20%] translate-y-[-50%] scale-75 brightness-[.4] opacity-0";
    }
  };

  const getStatusDisplay = (event) => {
    if (event.isPlaceholder) {
      return (
        <div className="inline-flex items-center bg-blue-500/20 text-blue-300 px-3 py-2 rounded-full text-sm sm:text-base font-medium">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Coming Soon
        </div>
      );
    }
    
    if (event.isActive) {
      return (
        <div className="inline-flex items-center bg-green-500/20 text-green-300 px-3 py-2 rounded-full text-sm sm:text-base font-medium">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Happening Now
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-full text-sm sm:text-base font-medium">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Coming Soon
        </div>
      );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full">
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <div className="relative h-[300px] flex items-center justify-center">
            <div className="w-[350px] h-[350px] sm:w-[600px] sm:h-[338px] rounded-xl bg-gradient-to-br from-purple-600/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 animate-pulse">
              <div className="p-4 sm:p-6 h-full flex flex-col justify-center items-center text-white">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full animate-spin mb-4"></div>
                <div className="text-lg sm:text-xl font-medium opacity-70">Loading Events...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentEvent = displayEvents[currentIndex];

  return (
    <div className="relative w-full">
      {/* Title Section */}
      {/* <div className="text-center mb-0">
        <h2 className="text-white text-4xl sm:text-6xl lg:text-2xl font-bold leading-tight uppercase">
          Boss Battle Events
        </h2>
      </div> */}

      {/* Carousel Section - Full Width */}
      <div className="relative w-full max-w-7xl mx-auto px-4">
        {/* Navigation Arrows - Only show if more than 1 event */}
        {displayEvents.length > 1 && (
          <div className="absolute inset-0 h-[300px] flex items-center justify-between z-20 px-4">
            <button
              onClick={goToPrevious}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white/30 sm:text-purple-500 dark:text-white hover:scale-90 dark:hover:bg-gray-700/20 duration-200 shadow-lg"
              aria-label="Previous event"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white/30 sm:text-purple-500 dark:text-white hover:scale-90 dark:hover:bg-gray-700/20 duration-200 shadow-lg"
              aria-label="Next event"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Cards Container */}
        <ul className="relative h-[300px]">
          {displayEvents.map((event, index) => (
            <li
              key={event.id}
              className={`absolute top-[50%] left-[50%] w-[350px] h-[350px] sm:w-[600px] sm:h-[338px] duration-400 ${
                index === currentIndex && !event.isPlaceholder 
                  ? 'cursor-pointer hover:scale-105' 
                  : displayEvents.length > 1 
                    ? 'cursor-pointer' 
                    : 'cursor-default'
              } ${getCardPosition(index)}`}
              onClick={() => {
                // If it's the center card, navigate to the event
                if (index === currentIndex) {
                  handleCardClick(event);
                } else if (displayEvents.length > 1) {
                  // Otherwise, just navigate to that slide
                  goToSlide(index);
                }
              }}
            >
              {/* Card with gradient border */}
              <div className={`relative w-full h-full rounded-xl overflow-hidden ${
                event.isPlaceholder 
                  ? 'bg-gradient-to-br from-blue-600/50 via-purple-500/50 to-indigo-500/50'
                  : 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500'
              } p-[3px]`}>

                <div className="relative w-full h-full rounded-lg overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/20">
                  {/* Dark overlay for better text contrast */}
                  <div className={`absolute inset-0 ${
                    event.isPlaceholder ? 'bg-black/40 dark:bg-black/60' : 'bg-black/25 dark:bg-black/40'
                  }`}></div>
                  
                  {/* Event Image/Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className={`w-16 h-16 sm:w-20 sm:h-20 object-contain ${
                        event.isPlaceholder ? 'opacity-20' : 'opacity-30'
                      }`}
                    />
                  </div>
                  
                  {/* Event Content Overlay */}
                  <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
                    {/* Top Content */}
                    <div className="text-white">
                      <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-white drop-shadow-lg ${
                        event.isPlaceholder ? 'text-blue-100' : 'text-white'
                      }`}>
                        {event.name}
                      </h3>
                      
                      {/* Event Description */}
                      <p className={`text-sm sm:text-base lg:text-lg line-clamp-3 drop-shadow-md ${
                        event.isPlaceholder 
                          ? 'text-blue-100/80 dark:text-blue-100/60' 
                          : 'text-white/90 dark:text-white/70'
                      }`}>
                        {event.description}
                      </p>
                    </div>

                    {/* Bottom Content */}
                    <div className="text-white text-center">
                      {/* Event Times */}
                      <div className={`space-y-1 mb-3 sm:mb-4 text-sm sm:text-base ${
                        event.isPlaceholder 
                          ? 'text-blue-100/80 dark:text-blue-100/60' 
                          : 'text-white/90 dark:text-white/70'
                      }`}>
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">Start:</span>
                          <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">End:</span>
                          <span>{event.endTime}</span>
                        </div>
                      </div>
                      
                      {/* Event Status */}
                      <div className="flex justify-center">
                        {getStatusDisplay(event)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Dot Indicators - Only show if more than 1 event */}
      {displayEvents.length > 1 && (
        <div className="flex justify-center space-x-2 mt-14">
          {displayEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-purple-600 dark:bg-white shadow-lg scale-125"
                  : "bg-gray-400 dark:bg-white/40 hover:bg-purple-500 dark:hover:bg-white/60"
              }`}
              aria-label={`Go to event ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventCarousel;
