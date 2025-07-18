import { useState, useEffect, useRef } from 'react';

// Custom hook for mouse tracking and liquid parallax effect
export const useMouseParallax = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get mouse position relative to viewport center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (e.clientX - centerX) / centerX; // Normalized -1 to 1
      const y = (e.clientY - centerY) / centerY; // Normalized -1 to 1
      
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return { mousePosition, isHovering };
};

// Liquid Parallax Decorative Element Component
export const LiquidDecorativeElement = ({ 
  className, 
  intensity = 1, 
  delay = 0,
  rotationIntensity = 0.5,
  ...props 
}) => {
  const { mousePosition, isHovering } = useMouseParallax();
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Calculate movement based on mouse position and intensity
    const moveX = mousePosition.x * intensity * 20; // Max 20px movement
    const moveY = mousePosition.y * intensity * 20;
    
    // Add subtle rotation based on mouse position (reduced for pill shapes)
    const rotation = (mousePosition.x * rotationIntensity * 8) + (mousePosition.y * rotationIntensity * 5);
    
    // Add gentle scaling effect when hovering (uniform scaling to preserve shape)
    const scale = isHovering ? 1.05 : 1;
    
    // Apply transform with smooth transition
    const transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg) scale(${scale})`;
    
    // Use requestAnimationFrame for smooth animation
    const animateElement = () => {
      element.style.transform = transform;
      element.style.transition = `transform 0.1s ease-out`;
    };

    // Add delay for staggered effect
    const timeoutId = setTimeout(animateElement, delay);

    return () => clearTimeout(timeoutId);
  }, [mousePosition, isHovering, intensity, delay, rotationIntensity]);

  return (
    <div
      ref={elementRef}
      className={`liquid-parallax-element ${className}`}
      style={{
        transition: 'transform 0.1s ease-out',
        transformOrigin: 'center',
      }}
      {...props}
    />
  );
};

// Enhanced version with more complex liquid movement
export const LiquidFloatingElement = ({ 
  className, 
  intensity = 1, 
  delay = 0,
  floatRange = 10,
  ...props 
}) => {
  const { mousePosition, isHovering } = useMouseParallax();
  const elementRef = useRef(null);
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });

  // Create floating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatOffset({
        x: Math.sin(Date.now() * 0.001 + delay) * floatRange,
        y: Math.cos(Date.now() * 0.0015 + delay) * floatRange,
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [delay, floatRange]);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Combine mouse parallax with floating animation
    const mouseX = mousePosition.x * intensity * 25;
    const mouseY = mousePosition.y * intensity * 25;
    
    const totalX = mouseX + floatOffset.x;
    const totalY = mouseY + floatOffset.y;
    
    // Add gentle rotation for pill shapes (reduced intensity)
    const mouseRotation = mousePosition.x * 6 + mousePosition.y * 3;
    const floatRotation = Math.sin(Date.now() * 0.002 + delay) * 8;
    const totalRotation = mouseRotation + floatRotation;
    
    // Gentle scale effect that preserves aspect ratio
    const scale = isHovering ? 1.08 : 1;
    const pulseScale = 1 + Math.sin(Date.now() * 0.003 + delay) * 0.03;
    const finalScale = scale * pulseScale;
    
    // Apply transform
    const transform = `translate(${totalX}px, ${totalY}px) rotate(${totalRotation}deg) scale(${finalScale})`;
    element.style.transform = transform;
    
  }, [mousePosition, isHovering, floatOffset, intensity, delay]);

  return (
    <div
      ref={elementRef}
      className={`liquid-floating-element ${className}`}
      style={{
        transition: 'transform 0.05s ease-out',
        transformOrigin: 'center',
        willChange: 'transform',
      }}
      {...props}
    />
  );
};

// Specialized component for pill-shaped elements that maintains their beautiful shape
export const LiquidPillElement = ({ 
  className, 
  intensity = 1.2, 
  delay = 0,
  floatRange = 8,
  ...props 
}) => {
  const { mousePosition, isHovering } = useMouseParallax();
  const elementRef = useRef(null);
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });

  // Create subtle floating animation for pills
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatOffset({
        x: Math.sin(Date.now() * 0.0008 + delay) * floatRange,
        y: Math.cos(Date.now() * 0.0012 + delay) * floatRange,
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [delay, floatRange]);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Enhanced movement for pill shapes with floating
    const mouseX = mousePosition.x * intensity * 18;
    const mouseY = mousePosition.y * intensity * 18;
    
    const totalX = mouseX + floatOffset.x;
    const totalY = mouseY + floatOffset.y;
    
    // Gentle rotation that enhances the pill shape movement
    const mouseRotation = mousePosition.x * 4 + mousePosition.y * 2;
    const floatRotation = Math.sin(Date.now() * 0.0015 + delay) * 6;
    const totalRotation = mouseRotation + floatRotation;
    
    // Very subtle scaling to keep pill shape intact
    const hoverScale = isHovering ? 1.05 : 1;
    const breatheScale = 1 + Math.sin(Date.now() * 0.002 + delay) * 0.02;
    const finalScale = hoverScale * breatheScale;
    
    // Apply transform that preserves the pill's elegant shape
    const transform = `translate(${totalX}px, ${totalY}px) rotate(${totalRotation}deg) scale(${finalScale})`;
    element.style.transform = transform;
    
  }, [mousePosition, isHovering, floatOffset, intensity, delay, floatRange]);

  return (
    <div
      ref={elementRef}
      className={`liquid-pill-floating ${className}`}
      style={{
        transition: 'transform 0.06s ease-out',
        transformOrigin: 'center',
        willChange: 'transform',
      }}
      {...props}
    />
  );
};

// Specialized component for perfect circular elements
export const LiquidCircleElement = ({ 
  className, 
  intensity = 1.0, 
  delay = 0,
  floatRange = 12,
  ...props 
}) => {
  const { mousePosition, isHovering } = useMouseParallax();
  const elementRef = useRef(null);
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });

  // Create floating animation for circles
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatOffset({
        x: Math.sin(Date.now() * 0.001 + delay) * floatRange,
        y: Math.cos(Date.now() * 0.0013 + delay) * floatRange,
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [delay, floatRange]);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Enhanced movement for perfect circles
    const mouseX = mousePosition.x * intensity * 22;
    const mouseY = mousePosition.y * intensity * 22;
    
    const totalX = mouseX + floatOffset.x;
    const totalY = mouseY + floatOffset.y;
    
    // More dynamic rotation for circles (they can handle it better)
    const mouseRotation = mousePosition.x * 8 + mousePosition.y * 5;
    const floatRotation = Math.sin(Date.now() * 0.0018 + delay) * 12;
    const totalRotation = mouseRotation + floatRotation;
    
    // Slightly more pronounced scaling for circles
    const hoverScale = isHovering ? 1.12 : 1;
    const pulseScale = 1 + Math.sin(Date.now() * 0.0025 + delay) * 0.04;
    const finalScale = hoverScale * pulseScale;
    
    // Apply transform for perfect circles
    const transform = `translate(${totalX}px, ${totalY}px) rotate(${totalRotation}deg) scale(${finalScale})`;
    element.style.transform = transform;
    
  }, [mousePosition, isHovering, floatOffset, intensity, delay, floatRange]);

  return (
    <div
      ref={elementRef}
      className={`liquid-circle-floating ${className}`}
      style={{
        transition: 'transform 0.08s ease-out',
        transformOrigin: 'center',
        willChange: 'transform',
        aspectRatio: '1 / 1', // Ensures perfect circles
      }}
      {...props}
    />
  );
};
