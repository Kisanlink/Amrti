import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 800);
    const timer2 = setTimeout(() => setStep(2), 2000);
    const timer3 = setTimeout(() => setStep(3), 3200);
    const timer4 = setTimeout(() => setStep(4), 4500);
    const timer5 = setTimeout(() => onComplete(), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-beige-400 via-beige-300 to-beige-500"
      >
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Geometric Grid */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 h-full">
              {[...Array(144)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0] }}
                  transition={{
                    duration: 4,
                    delay: (i % 12) * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  className="border border-secondary-200 aspect-square"
                />
              ))}
            </div>
          </div>

          {/* Floating Orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{ 
                opacity: [0, 0.1, 0],
                scale: [0, 1, 0],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight - 200,
                  Math.random() * window.innerHeight - 400,
                ],
              }}
              transition={{
                duration: 8,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
                                className={`absolute rounded-full ${
                    i % 2 === 0 ? 'bg-green-200' : 'bg-beige-200'
                  }`}
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
              }}
            />
          ))}
        </div>

        {/* Main Content Container */}
        <div className="relative text-center max-w-4xl mx-auto px-8">
          {/* Company Logo/Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotateY: -180 }}
            animate={{ 
              opacity: step >= 0 ? 1 : 0,
              scale: step >= 0 ? 1 : 0,
              rotateY: step >= 0 ? 0 : -180,
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            className="mb-12"
          >
            <div className="relative inline-block">
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-secondary-200 rounded-full opacity-30"
              />
              
              {/* Inner Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-primary-300 rounded-full opacity-40"
              />
              
              {/* Logo Container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-white to-primary-100 rounded-full shadow-2xl flex items-center justify-center border border-secondary-100">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12"
                >
                  <img 
                    src="/logo.png" 
                    alt="Amrti Logo" 
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: step >= 1 ? 1 : 0,
              y: step >= 1 ? 0 : 50,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h1 
              className="text-7xl font-heading font-bold mb-4 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #2d7d4a 0%, #1f422c 50%, #0f2416 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                fontWeight: 700
              }}
            >
              AMRTI
            </motion.h1>
            
            {/* Animated Underline */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: step >= 1 ? "100%" : 0,
                opacity: step >= 1 ? 1 : 0,
              }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-transparent via-secondary-400 to-transparent mx-auto rounded-full"
            />
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: step >= 2 ? 1 : 0,
              y: step >= 2 ? 0 : 30,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
            <p className="text-xl text-gray-600 font-sans font-normal leading-relaxed">
              Premium Natural Products for{' '}
              <span className="font-heading font-medium text-secondary-700">Health & Wellness</span>
            </p>
          </motion.div>

          {/* Feature Points */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: step >= 3 ? 1 : 0,
              y: step >= 3 ? 0 : 30,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { icon: "🌱", text: "Sustainably Sourced" },
                { icon: "👨‍🌾", text: "Farmer Empowered" },
                { icon: "💚", text: "Premium Quality" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: step >= 3 ? 1 : 0,
                    scale: step >= 3 ? 1 : 0.8,
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2 + index * 0.1, 
                    ease: "easeOut" 
                  }}
                  className="text-center"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm text-gray-600 font-heading font-medium tracking-wide">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Loading Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: step >= 4 ? 1 : 0,
              scale: step >= 4 ? 1 : 0.9,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-gray-500 text-sm font-medium tracking-wide">
              Preparing your wellness journey...
            </p>
            
            {/* Progress Bar */}
            <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step >= 4 ? "100%" : 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full"
              />
            </div>
            
            {/* Loading Dots */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 bg-secondary-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: step >= 2 ? 1 : 0,
            y: step >= 2 ? 0 : 20,
          }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center"
        >
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-2">
            Empowering Farmers • Nurturing Wellness
          </p>
          <motion.div
            animate={{ 
              width: [0, 80, 0],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-px bg-gradient-to-r from-transparent via-secondary-300 to-transparent mx-auto"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeScreen; 