import { motion } from 'framer-motion';
import { Target, Heart, Leaf, Users, Award, Globe } from 'lucide-react';

const MissionSection = () => {
  const missions = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower farmers and SHGs through sustainable agricultural practices while providing premium natural products to consumers.',
      color: 'green'
    },
    {
      icon: Heart,
      title: 'Our Vision',
      description: 'To become the leading brand in natural wellness products while creating positive impact in farming communities.',
      color: 'beige'
    }
  ];

  const values = [
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and sustainable farming methods.',
      color: 'green'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Supporting local farmers and self-help groups for mutual growth.',
      color: 'beige'
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'Maintaining the highest standards in product quality and safety.',
      color: 'green'
    },
    {
      icon: Globe,
      title: 'Innovation',
      description: 'Continuously innovating with solar dryers and processing techniques.',
      color: 'beige'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-beige-300 to-beige-400">
      <div className="container-custom">
        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
            Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Mission</span> & Vision
          </h2>
          <p className="text-lg text-black-700 max-w-3xl mx-auto">
            Empowering farmers through sustainable practices while delivering premium natural products to enhance your wellness journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {missions.map((mission, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br from-${mission.color}-500 to-${mission.color}-600`}>
                  <mission.icon className="w-8 h-8 text-white-50" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-heading font-bold text-black-900 mb-3">
                    {mission.title}
                  </h3>
                  <p className="text-black-700 leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-heading font-bold text-black-900 mb-4">
            Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Core Values</span>
          </h3>
          <p className="text-lg text-black-700 max-w-2xl mx-auto">
            The principles that guide our every decision and action
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl text-center hover:shadow-2xl transition-all duration-300"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br from-${value.color}-500 to-${value.color}-600 mb-4`}>
                <value.icon className="w-8 h-8 text-white-50" />
              </div>
              <h4 className="text-xl font-heading font-bold text-black-900 mb-3">
                {value.title}
              </h4>
              <p className="text-black-700 text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MissionSection; 