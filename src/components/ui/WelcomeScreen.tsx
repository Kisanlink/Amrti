import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeScreenProps {
  onComplete: () => void;
  duration?: number;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onComplete, 
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'entrance' | 'hold' | 'exit'>('entrance');
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const tagline = "NATURE'S ELIXIR FOR YOUR WELLNESS";

  // Typewriter effect
  useEffect(() => {
    if (currentIndex < tagline.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + tagline[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80); // Adjust speed here
      return () => clearTimeout(timer);
    }
  }, [currentIndex, tagline]);

  useEffect(() => {
    // Entrance phase
    const entranceTimer = setTimeout(() => {
      setPhase('hold');
    }, 1500);

    // Hold phase
    const holdTimer = setTimeout(() => {
      setPhase('exit');
    }, 3000);

    // Exit phase
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000);
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
          {/* Organic Background Elements */}
          <div className="absolute inset-0">
            {/* Organic Leaf-like Shapes */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
            >
              {/* Large organic shapes */}
              <motion.div
                className="absolute top-20 left-20 w-32 h-32 bg-green-100/30 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 45, 0],
                  borderRadius: ["50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50%"]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-32 right-32 w-24 h-24 bg-green-200/25 rounded-full"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [0, -30, 0],
                  borderRadius: ["50%", "40% 60% 60% 40% / 40% 40% 60% 60%", "50%"]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <motion.div
                className="absolute top-1/2 right-20 w-20 h-20 bg-green-300/20 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 60, 0],
                  borderRadius: ["50%", "60% 40% 40% 60% / 60% 60% 40% 40%", "50%"]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              />
            </motion.div>

            {/* Floating Organic Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400/40 rounded-full"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  opacity: [0.2, 0.7, 0.2],
                  scale: [1, 1.8, 1]
                }}
                transition={{
                  duration: 5 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Additional Organic Leaf Shapes */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-16 h-16 bg-green-100/20 rounded-full"
              animate={{ 
                scale: [1, 1.4, 1],
                rotate: [0, 120, 0],
                borderRadius: ["50%", "60% 40% 40% 60% / 60% 60% 40% 40%", "50%"]
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-green-200/25 rounded-full"
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [0, -90, 0],
                borderRadius: ["50%", "40% 60% 60% 40% / 40% 40% 60% 60%", "50%"]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            />
            <motion.div
              className="absolute top-2/3 right-1/4 w-14 h-14 bg-green-300/15 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                rotate: [0, 180, 0],
                borderRadius: ["50%", "70% 30% 30% 70% / 70% 70% 30% 30%", "50%"]
              }}
              transition={{ 
                duration: 9, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />

            {/* Organic Vine-like Elements */}
            <motion.div
              className="absolute top-10 right-10 w-20 h-2 bg-green-300/20 rounded-full"
              animate={{ 
                scaleX: [1, 1.5, 1],
                rotate: [0, 15, 0],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 left-10 w-16 h-2 bg-green-400/25 rounded-full"
              animate={{ 
                scaleX: [1.2, 1, 1.2],
                rotate: [0, -20, 0],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            {/* Large Logo Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ 
                scale: phase === 'exit' ? 0.2 : 1,
                opacity: phase === 'exit' ? 0 : 1,
                y: phase === 'exit' ? -100 : 0
              }}
              transition={{ 
                duration: phase === 'exit' ? 1.5 : 1.2,
                ease: "easeInOut"
              }}
              className="mb-8"
            >
              <div className="relative">
                <img 
                  src="/logo2.png" 
                  alt="Amrti Logo" 
                  className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto drop-shadow-2xl"
                  onError={(e) => {
                    console.error('Failed to load logo:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Enhanced Glow Effect */}
                <motion.div
                  className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto bg-green-200/20 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            {/* Tagline with Typewriter Effect */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: phase === 'exit' ? 0 : 1,
                y: phase === 'exit' ? -50 : 0
              }}
              transition={{ 
                duration: 0.8,
                delay: 0.8
              }}
              className="mb-6"
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-green-800 tracking-wider">
                <span className="font-medium">{displayedText}</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-green-600 ml-1"
                >
                  |
                </motion.span>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: phase === 'exit' ? 0 : 1,
                y: phase === 'exit' ? -30 : 0
              }}
              transition={{ 
                duration: 0.8,
                delay: 2.5
              }}
              className="text-xl sm:text-2xl lg:text-3xl text-green-800 font-medium tracking-wider"
            >
              <span className="inline-block mx-2">Pure</span>
              <span className="text-green-600">•</span>
              <span className="inline-block mx-2">Natural</span>
              <span className="text-green-600">•</span>
              <span className="inline-block mx-2">Organic</span>
            </motion.div>
          </div>

          {/* Organic Overlay that fades in during exit */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-beige-100/0 to-green-50/0"
            animate={{ 
              background: phase === 'exit' 
                ? "linear-gradient(to bottom right, rgba(240, 253, 244, 0.8), rgba(254, 252, 232, 0.8), rgba(240, 253, 244, 0.8))"
                : "linear-gradient(to bottom right, rgba(240, 253, 244, 0), rgba(254, 252, 232, 0), rgba(240, 253, 244, 0))"
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
