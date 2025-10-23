// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

// ===== API CLIENT ===== //
import { apiClient } from "@/api/apiClient";

// ===== UTILITIES ===== //
import { formatTextualDateTime } from "@/utils/helper";

const EventCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/events/public");
        const eventsData = response.data || [];

        // Format events for the carousel
        const formattedEvents = eventsData.map((event) => ({
          id: event.id,
          name: event.name,
          title: "Interactive Boss Battle Experience",
          description:
            event.description ||
            "Join forces with other participants and put your knowledge to the test! Answer questions, deal damage, and work together to defeat powerful bosses.",
          startAt: formatTextualDateTime(event.startAt) || "TBD",
          endAt: formatTextualDateTime(event.endAt) || "TBD",
          image:
            "https://em-content.zobj.net/source/microsoft-3D-fluent/406/crossed-swords_2694-fe0f.png",
          isActive: event.status === "ongoing",
          status: event.status || "upcoming",
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Placeholder event for when no events exist
  const placeholderEvents = [
    {
      id: "placeholder-1",
      name: "No Events Scheduled",
      title: "Stay Tuned for Epic Battles",
      description:
        "Some boss battle events are being planned! Check back soon for exciting interactive experiences where you can team up with others to defeat powerful bosses.",
      startAt: "--",
      endAt: "--",
      image:
        "https://em-content.zobj.net/source/microsoft-3D-fluent/406/crossed-swords_2694-fe0f.png",
      isActive: false,
      status: "upcoming",
      isPlaceholder: true,
    },
  ];

  // Use placeholder if no events or isLoading failed
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
    setCurrentIndex(
      currentIndex === 0 ? displayEvents.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      currentIndex === displayEvents.length - 1 ? 0 : currentIndex + 1
    );
  };

  const handleCardClick = (event) => {
    if (event.isPlaceholder) return;

    navigate(`/event-bosses?eventId=${event.id}`);
  };

  const getCardPosition = (index) => {
    const diff = index - currentIndex;

    if (diff === 0)
      return "translate-x-[-50%] translate-y-[-50%] z-10 scale-100 brightness-100"; // Center card
    else if (diff === -1 || diff === displayEvents.length - 1)
      return "translate-x-[-66%] sm:translate-x-[-80%] translate-y-[-50%] scale-75 brightness-[.4]"; // Left card - closer to center on mobile
    else if (diff === 1 || diff === -(displayEvents.length - 1))
      return "translate-x-[-34%] sm:translate-x-[-20%] translate-y-[-50%] scale-75 brightness-[.4]"; // Right card - closer to center on mobile
    else
      return "translate-x-[-35%] sm:translate-x-[-20%] translate-y-[-50%] scale-75 brightness-[.4] opacity-0"; // Hidden cards - closer to center on mobile
  };

  const getStatusDisplay = (event) => {
    if (event.status === "upcoming") {
      return (
        <div className="inline-flex items-center bg-purple-500/20 text-purple-300 px-3 py-2 rounded-full text-sm sm:text-base font-medium">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Coming Soon
        </div>
      );
    } else if (event.status === "ongoing") {
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
          Ended
        </div>
      );
    }
  };

  // Show isLoading state
  if (isLoading) {
    return (
      <div className="relative w-full">
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <div className="relative h-[300px] flex items-center justify-center">
            <div className="w-[350px] h-[350px] sm:w-[600px] sm:h-[338px] rounded-xl bg-purple-600/20 backdrop-blur-sm border border-white/20 animate-pulse">
              <div className="p-4 sm:p-6 h-full flex flex-col justify-center items-center text-white">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full animate-spin mb-4"></div>
                <div className="text-lg sm:text-xl font-medium opacity-70">
                  Loading Events...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel Section - Full Width */}
      <div className="relative w-full max-w-7xl mx-auto px-4">
        {/* Navigation Arrows - Only show if more than 1 event */}
        {displayEvents.length > 1 && (
          <div className="absolute inset-0 h-[300px] flex items-center justify-between px-4">
            <button
              onClick={goToPrevious}
              className="z-11 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white/30 sm:text-purple-500 dark:text-white hover:scale-90 dark:hover:bg-gray-700/20 duration-200 shadow-lg"
              aria-label="Previous event"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="z-11 bg-white/10 dark:bg-gray-800/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-white/30 sm:text-purple-500 dark:text-white hover:scale-90 dark:hover:bg-gray-700/20 duration-200 shadow-lg"
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
                  ? "cursor-pointer hover:scale-105"
                  : displayEvents.length > 1
                  ? "cursor-pointer"
                  : "cursor-default"
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
              {/* Card with solid border */}
              <div
                className={`relative w-full h-full rounded-xl overflow-hidden ${
                  event.isPlaceholder ? "bg-purple-800/60" : "bg-purple-600"
                } p-[3px]`}
              >
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 dark:border-white/20">
                  {/* Dark overlay for better text contrast */}
                  <div
                    className={`absolute inset-0 ${
                      event.isPlaceholder
                        ? "bg-black/30 dark:bg-black/50"
                        : "bg-black/25 dark:bg-black/40"
                    }`}
                  ></div>

                  {/* Event Image/Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={event.image}
                      alt={event.name}
                      className={`w-16 h-16 sm:w-20 sm:h-20 object-contain ${
                        event.isPlaceholder ? "opacity-20" : "opacity-30"
                      }`}
                    />
                  </div>

                  {/* Event Content Overlay */}
                  <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col justify-between">
                    {/* Top Content */}
                    <div className="text-white">
                      <h3
                        className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-white drop-shadow-lg ${
                          event.isPlaceholder ? "text-purple-100" : "text-white"
                        }`}
                      >
                        {event.name}
                      </h3>

                      {/* Event Description */}
                      <p
                        className={`text-sm sm:text-base lg:text-lg line-clamp-3 drop-shadow-md ${
                          event.isPlaceholder
                            ? "text-purple-100/80 dark:text-purple-100/70"
                            : "text-white/90 dark:text-white/70"
                        }`}
                      >
                        {event.description}
                      </p>
                    </div>

                    {/* Bottom Content */}
                    <div className="text-white text-center">
                      {/* Event Times */}
                      <div
                        className={`space-y-1 mb-3 sm:mb-4 text-sm sm:text-base ${
                          event.isPlaceholder
                            ? "text-purple-100/80 dark:text-purple-100/70"
                            : "text-white/90 dark:text-white/70"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">Start:</span>
                          <span>{event.startAt}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">End:</span>
                          <span>{event.endAt}</span>
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
                  ? "bg-purple-600 shadow-lg scale-125"
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
