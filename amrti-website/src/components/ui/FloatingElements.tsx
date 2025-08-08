import { motion } from 'framer-motion';
import { Leaf, Circle, Star, Heart } from 'lucide-react';

interface FloatingElementsProps {
  count?: number;
  className?: string;
}

const FloatingElements = ({ count = 15, className = '' }: FloatingElementsProps) => {
  const icons = [Leaf, Circle, Star, Heart];
  
  const elements = Array.from({ length: count }, (_, i) => {
    const IconComponent = icons[i % icons.length];
    const size = Math.random() * 20 + 10; // 10-30px
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 10; // 10-20s
    const x = Math.random() * 100; // 0-100%
    const y = Math.random() * 100; // 0-100%
    
    return {
      id: i,
      Icon: IconComponent,
      size,
      delay,
      duration,
      x,
      y,
    };
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element) => (
        <motion.div
          key={element.id}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: `${element.x}vw`,
            y: `${element.y}vh`,
          }}
          animate={{
            opacity: [0, 0.3, 0.6, 0.3, 0],
            scale: [0, 1, 1.2, 1, 0],
            y: [`${element.y}vh`, `${element.y - 20}vh`, `${element.y - 40}vh`],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
            ease: "easeInOut",
          }}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
        >
          <element.Icon 
            size={element.size}
            className="text-secondary-200"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements; 