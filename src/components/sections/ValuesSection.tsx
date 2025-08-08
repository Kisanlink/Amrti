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
    <section className="section-padding bg-primary-300">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Our <span className="text-gradient">Core Values</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do, from sourcing to serving our customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: value.delay }}
              whileHover={{ y: -10 }}
              className="card p-8 text-center group"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`inline-flex p-4 rounded-full mb-6 ${getColorClasses(value.color)}`}
              >
                <value.icon size={32} />
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-secondary-600 transition-colors">
                {value.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
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
          className="mt-16 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Living Our Values Every Day
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
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