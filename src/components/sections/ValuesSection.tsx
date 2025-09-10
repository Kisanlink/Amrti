import { motion } from 'framer-motion';
import { Droplets, BookOpen, Leaf, Heart } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: Droplets,
      title: 'PURITY',
      description: 'Sourcing from natural ingredients and crafted with precision',
      color: 'secondary',
      delay: 0,
    },
    {
      icon: BookOpen,
      title: 'HERITAGE',
      description: 'Preserving traditional techniques and flavours to celebrate cultural richness',
      color: 'primary',
      delay: 0.1,
    },
    {
      icon: Leaf,
      title: 'SUSTAINABILITY',
      description: 'Supporting farmers through fair trade practices',
      color: 'accent',
      delay: 0.2,
    },
    {
      icon: Heart,
      title: 'WELLNESS',
      description: 'Enhancing consumer well-being through healthier lifestyle',
      color: 'secondary',
      delay: 0.3,
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary-100 text-primary-600';
      case 'secondary':
        return 'bg-secondary-100 text-secondary-600';
      case 'accent':
        return 'bg-accent-100 text-accent-600';
      default:
        return 'bg-secondary-100 text-secondary-600';
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-primary-300">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Our <span className="text-gradient">Core Values</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do, from sourcing to serving our customers
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: value.delay }}
              whileHover={{ y: -5 }}
              className="card p-4 md:p-6 text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className={`inline-flex p-2 md:p-3 rounded-full mb-3 md:mb-4 ${getColorClasses(value.color)}`}
              >
                <value.icon size={20} className="md:w-6 md:h-6" />
              </motion.div>
              
              <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-secondary-600 transition-colors">
                {value.title}
              </h3>
              
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Values Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8"
        >
          <div className="max-w-3xl mx-auto pl-4 md:pl-6 pr-4 md:pr-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
              Living Our Values Every Day
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed text-left">
              From the moment we source our ingredients to the final product that reaches your table, 
              every step is guided by our commitment to purity, heritage, sustainability, and wellness. 
              We believe that exceptional quality comes from honoring these principles in everything we do.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuesSection; 