// ===== LIBRARIES ===== //
import { createContext, useContext, useState, useEffect, useRef } from 'react';

// ===== CONTEXT ===== //
const IntersectionContext = createContext();

// ===== HOOK ===== //
export const useIntersectionObserver = () => {
  const context = useContext(IntersectionContext);
  if (!context) {
    throw new Error('useIntersectionObserver must be used within IntersectionObserverProvider');
  }
  return context;
};

// ===== PROVIDER COMPONENT ===== //
const IntersectionObserverProvider = ({ children, initialVisible = [] }) => {
  const [visibleSections, setVisibleSections] = useState(new Set(initialVisible));
  const sectionRefs = useRef({});

  // ===== INTERSECTION OBSERVER ===== //
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // ===== REGISTER SECTION REF ===== //
  const registerSection = (id, element) => {
    if (element) {
      sectionRefs.current[id] = element;
    }
  };

  // ===== CHECK IF SECTION IS VISIBLE ===== //
  const isVisible = (sectionId) => {
    return visibleSections.has(sectionId);
  };

  // ===== CONTEXT VALUE ===== //
  const value = {
    visibleSections,
    registerSection,
    isVisible
  };

  return (
    <IntersectionContext.Provider value={value}>
      {children}
    </IntersectionContext.Provider>
  );
};

export default IntersectionObserverProvider;
