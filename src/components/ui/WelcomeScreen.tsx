import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
  duration?: number;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onComplete, 
  duration = 3500 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'entrance' | 'hold' | 'exit'>('entrance');
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const tagline = "NATURE'S ELIXIR FOR YOUR WELLNESS";

  // Optimized typewriter effect
  useEffect(() => {
    if (currentIndex < tagline.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + tagline[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 60); // Faster, smoother typing
      return () => clearTimeout(timer);
    }
  }, [currentIndex, tagline]);

  useEffect(() => {
    // Entrance phase
    const entranceTimer = setTimeout(() => {
      setPhase('hold');
    }, 1200);

    // Hold phase
    const holdTimer = setTimeout(() => {
      setPhase('exit');
    }, 2500);

    // Exit phase
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, duration);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-gradient-to-br from-green-50 via-beige-100 to-green-50 flex items-center justify-center z-[9999] overflow-hidden"
        >
          {/* Simplified Professional Background */}
          <div className="absolute inset-0">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-green-100/30" />
            
            {/* Minimal floating elements for performance */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-green-300/20 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Professional accent shapes */}
            <motion.div
              className="absolute top-16 left-16 w-24 h-24 bg-green-100/20 rounded-full"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-20 h-20 bg-green-200/15 rounded-full"
              animate={{ 
                scale: [1.1, 1, 1.1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            {/* Professional Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ 
                scale: phase === 'exit' ? 0.3 : 1,
                opacity: phase === 'exit' ? 0 : 1,
                y: phase === 'exit' ? -80 : 0
              }}
              transition={{ 
                duration: phase === 'exit' ? 1.2 : 0.8,
                ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smoothness
              }}
              className="mb-12"
            >
              <div className="relative flex items-center justify-center">
                {/* Logo Container with Professional Styling */}
                <div className="relative p-6 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
                  <img 
                    src="/logo2.png" 
                    alt="Amrti Logo" 
                    className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 object-contain filter drop-shadow-lg"
                    style={{ 
                      aspectRatio: '1/1',
                      objectFit: 'contain',
                      imageRendering: 'high-quality'
                    }}
                    onError={(e) => {
                      console.error('Failed to load logo:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Subtle Professional Glow */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-200/10 to-green-300/10 rounded-3xl blur-xl"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Professional Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: phase === 'exit' ? 0 : 1,
                y: phase === 'exit' ? -40 : 0
              }}
              transition={{ 
                duration: 0.6,
                delay: 0.6,
                ease: "easeOut"
              }}
              className="mb-8"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-green-800 tracking-wide leading-relaxed">
                <span className="font-medium">{displayedText}</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="text-green-600 ml-1 font-light"
                >
                  |
                </motion.span>
              </div>
            </motion.div>

            {/* Professional Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: phase === 'exit' ? 0 : 1,
                y: phase === 'exit' ? -25 : 0
              }}
              transition={{ 
                duration: 0.6,
                delay: 2.2,
                ease: "easeOut"
              }}
              className="text-lg sm:text-xl lg:text-2xl text-green-700 font-medium tracking-wide"
            >
              <span className="inline-block mx-3 opacity-90">Pure</span>
              <span className="text-green-500 mx-2">•</span>
              <span className="inline-block mx-3 opacity-90">Natural</span>
              <span className="text-green-500 mx-2">•</span>
              <span className="inline-block mx-3 opacity-90">Organic</span>
            </motion.div>
          </div>

          {/* Professional Exit Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-beige-100/0 to-green-50/0"
            animate={{ 
              opacity: phase === 'exit' ? 1 : 0
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
