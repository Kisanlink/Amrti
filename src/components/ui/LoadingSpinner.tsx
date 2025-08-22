import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Rotating Ring */}
        <motion.div
          className="w-16 h-16 border-2 border-green-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Logo Container */}
        <div className="absolute top-2 left-2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-green-100">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-8 h-8"
          >
            <img 
              src="/logo2.png" 
              alt="Amriti Nature's Elixir" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>
        
        {/* Pulsing Glow */}
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 bg-green-200/20 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner; 