/**
 * Confetti utility for creating celebration effects
 * Uses TSParticles confetti library for smooth animations
 */

/**
 * Loads the confetti library dynamically if not already loaded
 * @returns {Promise} Promise that resolves when the library is loaded
 */
const loadConfettiLibrary = () => {
  return new Promise((resolve) => {
    if (window.confetti) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@tsparticles/confetti@3.0.3/tsparticles.confetti.bundle.min.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

/**
 * Fires a single confetti burst with specified parameters
 * @param {number} particleRatio - Ratio of particles to fire (0-1)
 * @param {Object} opts - Additional confetti options
 * @param {Object} defaults - Default confetti settings
 */
const fireSingleBurst = (particleRatio, opts, defaults) => {
  const count = 200;
  
  window.confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  );
};

/**
 * Creates a full confetti celebration with multiple bursts
 * @param {Object} options - Configuration options
 * @param {Object} options.origin - Starting position for confetti (default: { y: 0.7 })
 * @param {number} options.maxBursts - Maximum number of confetti bursts (default: 3)
 * @param {number} options.burstInterval - Time between bursts in ms (default: 2000)
 * @param {Function} options.onComplete - Callback when all bursts are complete
 */
export const startConfettiCelebration = async (options = {}) => {
  const {
    origin = { y: 0.7 },
    maxBursts = 3,
    burstInterval = 2000,
    onComplete = () => {}
  } = options;

  const defaults = { origin };

  // Load the confetti library
  await loadConfettiLibrary();

  /**
   * Fires a complete confetti sequence with multiple patterns
   */
  const fireConfettiSequence = () => {
    // Burst 1: Tight spread, high velocity
    fireSingleBurst(0.25, {
      spread: 26,
      startVelocity: 55,
    }, defaults);

    // Burst 2: Medium spread
    fireSingleBurst(0.2, {
      spread: 60,
    }, defaults);

    // Burst 3: Wide spread with decay
    fireSingleBurst(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    }, defaults);

    // Burst 4: Very wide, slow particles
    fireSingleBurst(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    }, defaults);

    // Burst 5: Wide, fast particles
    fireSingleBurst(0.1, {
      spread: 120,
      startVelocity: 45,
    }, defaults);
  };

  let burstCount = 0;

  // Fire immediately
  fireConfettiSequence();
  burstCount++;

  // Set up interval for additional bursts
  const interval = setInterval(() => {
    if (burstCount < maxBursts) {
      fireConfettiSequence();
      burstCount++;
    } else {
      clearInterval(interval);
      onComplete();
    }
  }, burstInterval);

  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
};

/**
 * Hook for React components to easily add confetti celebrations
 * @param {Object} options - Configuration options (same as startConfettiCelebration)
 * @returns {Object} Object with trigger function and cleanup
 */
export const useConfetti = (options = {}) => {
  let cleanup = null;

  const triggerConfetti = async () => {
    // Clean up any existing confetti
    if (cleanup) {
      cleanup();
    }

    cleanup = await startConfettiCelebration(options);
  };

  const stopConfetti = () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };

  return {
    triggerConfetti,
    stopConfetti
  };
};

export default {
  startConfettiCelebration,
  useConfetti
};
