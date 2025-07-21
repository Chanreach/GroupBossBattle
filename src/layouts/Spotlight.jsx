// ===== LIBRARIES ===== //
import { useState, useEffect } from "react";

// ===== STYLES ===== //
import "@/index.css";

const Spotlight = ({
    children,
    duration = 3500, // Total duration before spotlight starts fading
    fadeOutDuration = 2000, // Duration for spotlight fade out
    sweepDuration = 2000, // Duration for spotlight sweep animation
    onRevealComplete = null, // Callback when reveal is complete
    className = ""
}) => {
    const [showSpotlight, setShowSpotlight] = useState(true);
    const [revealComplete, setRevealComplete] = useState(false);
    const [spotlightPosition, setSpotlightPosition] = useState(200); // Start at 200%

    useEffect(() => {
        // Smooth animation function using requestAnimationFrame
        const animateSpotlight = () => {
            const startTime = performance.now();
            const startPosition = 150;
            const endPosition = 50;
            const distance = startPosition - endPosition; // 100

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / sweepDuration, 1); // 0 to 1
                
                // iOS-style fluid easing - slower at the end with more gradual deceleration
                const eased = 1 - Math.pow(1 - progress, 3.5); // Slightly stronger ease-out
                
                // Add subtle spring/bounce for iOS feel - reduced intensity
                const spring = progress > 0.85 
                    ? eased + (Math.sin((progress - 0.85) * 12) * 0.008 * (1 - progress))
                    : eased;
                
                const currentPosition = startPosition - (distance * spring);
                setSpotlightPosition(currentPosition);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        };

        // Start animation after initial delay
        const sweepTimer = setTimeout(() => {
            animateSpotlight();
        }, 500); // Start sweep after 500ms

        // Spotlight reveal sequence
        const fadeTimer = setTimeout(() => {
            setShowSpotlight(false);
            // After spotlight fade, mark reveal as complete
            setTimeout(() => {
                setRevealComplete(true);
                if (onRevealComplete) {
                    onRevealComplete();
                }
            }, fadeOutDuration);
        }, duration);

        // Cleanup
        return () => {
            clearTimeout(sweepTimer);
            clearTimeout(fadeTimer);
        };
    }, [duration, fadeOutDuration, sweepDuration, onRevealComplete]);

    return (
        <div className={`relative ${className}`}>
            {/* Spotlight Overlay */}
            <div
                className={`fixed inset-0 z-[101] pointer-events-none spotlight-overlay transition-opacity duration-[2000ms] ease-out ${showSpotlight ? 'opacity-45' : 'opacity-0'
                    }`}
                style={{
                    background: `radial-gradient(circle min(625px, 110vw) at ${spotlightPosition}% 37%, transparent 0%, transparent 43%, rgba(0, 0, 0, 0.92) 50%, rgba(0, 0, 0, 0.98) 100%)`,
                }}
            />

            {/* Content with reveal animation */}
            <div className={`content-reveal ${revealComplete ? 'opacity-100 transform translate-y-0' : 'opacity-100 transform translate-y-1'
                }`}>
                {/* Render children with spotlight-focused class when spotlight is active */}
                {typeof children === 'function'
                    ? children({ showSpotlight, revealComplete })
                    : children
                }
            </div>
        </div>
    );
};

export default Spotlight;
