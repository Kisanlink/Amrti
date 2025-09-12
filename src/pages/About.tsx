import { motion } from 'framer-motion';
import { Users, Heart, Leaf, Award, Target, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { icon: Users, number: '500+', label: 'Farmers Empowered', description: 'Supporting rural communities' },
    { icon: Heart, number: '10,000+', label: 'Happy Customers', description: 'Trusted by families nationwide' },
    { icon: Leaf, number: '50+', label: 'Organic Products', description: 'Pure and natural ingredients' },
    { icon: Award, number: '15+', label: 'Quality Awards', description: 'Recognized excellence' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Community First',
      description: 'We prioritize the well-being of our farming communities, ensuring fair compensation and sustainable partnerships.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Leaf,
      title: 'Natural Excellence',
      description: 'Every product is crafted with the finest organic ingredients, preserving nature\'s goodness.',
      color: 'from-beige-500 to-beige-600'
    },
    {
      icon: Target,
      title: 'Quality Assurance',
      description: 'Rigorous testing and quality control ensure every product meets our high standards.',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Your health and satisfaction drive every decision we make in product development.',
      color: 'from-beige-600 to-beige-700'
    }
  ];

  const achievements = [
    'Empowered 500+ farmers with sustainable income',
    'Processed 50+ organic products with zero preservatives',
    'Delivered 10,000+ orders with 99% customer satisfaction',
    'Received 15+ quality certifications and awards',
    'Established 20+ Self-Help Groups across India',
    'Created 100+ direct employment opportunities'
  ];

  return (
    <div className="pt-20 bg-beige-200 min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-beige-400 via-beige-300 to-beige-500 w-full">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="relative z-10 container-custom py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white-50 rounded-full text-sm font-heading font-semibold mb-6">
              <Heart className="w-5 h-5" />
              <span>Our Story</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-black-900 mb-6">
              About <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Amrti</span>
            </h1>
            <p className="text-xl text-black-700 max-w-3xl mx-auto leading-relaxed">
              Empowering farmers and communities through sustainable agriculture and premium natural products
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 bg-beige-100 w-full">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Mission */}
            <div className="h-full">
              <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                      <Target className="w-6 h-6 text-white-50" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900">Our Mission</h2>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-base sm:text-lg text-black-700 leading-relaxed mb-4">
                      To transform the agricultural landscape by providing farmers with sustainable solutions that enhance their livelihoods while promoting eco-friendly practices and delivering premium natural products to consumers.
                    </p>
                    <p className="text-base sm:text-lg text-black-700 leading-relaxed">
                      We specialize in processing dried vegetables and fruits into high-quality powders, extending shelf life and adding value to raw materials sourced from our partner farmers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="h-full">
              <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-beige-500 to-beige-600">
                      <Award className="w-6 h-6 text-white-50" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black-900">Our Vision</h2>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-base sm:text-lg text-black-700 leading-relaxed mb-4">
                      To become the leading brand in natural wellness products, recognized for our commitment to farmer empowerment, sustainable practices, and premium quality.
                    </p>
                    <p className="text-base sm:text-lg text-black-700 leading-relaxed">
                      We envision a future where every household has access to pure, natural products while supporting the livelihoods of farming communities across India.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 sm:py-20 bg-gradient-to-br from-green-100 to-green-200 w-full">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
              Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Impact</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              Numbers that tell the story of our commitment to community and quality
            </p>
          </div>


          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group"
              >
                <div className="relative p-4 sm:p-6 rounded-xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-lg text-center">
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600">
                        <stat.icon className="w-6 h-6 text-white-50" />
                      </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-heading font-bold text-black-900 mb-1">{stat.number}</h3>
                    <h4 className="text-sm sm:text-base font-heading font-semibold text-green-700 mb-2">{stat.label}</h4>
                    <p className="text-xs sm:text-sm text-black-700">{stat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-beige-400 to-beige-500 w-full">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Story Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4 sm:mb-6">
                Our <span className="text-green-600">Story</span>
              </h2>
              <p className="text-base sm:text-lg text-russet-700 leading-relaxed mb-4 sm:mb-6 font-medium">
                Amrti is a brand conceived with the intention of empowering farmers and Self-Help Groups (SHGs) 
                through an innovative buy-back model utilizing solar dryers. Our mission is to transform the 
                agricultural landscape by providing farmers with sustainable solutions that enhance their livelihoods 
                while promoting eco-friendly practices.
              </p>
              <p className="text-base sm:text-lg text-black-700 leading-relaxed mb-6 sm:mb-8">
                At Amrti, we specialize in processing dried vegetables and fruits into high-quality powders. 
                This not only extends the shelf life of these nutritious products but also adds value to the 
                raw materials sourced from our farmers.
              </p>
            </div>

            {/* Story Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 sm:gap-8">
              {[
                {
                  icon: Users,
                  title: 'Empowerment for Farmers',
                  description: 'Providing farmers with a steady income stream through our reliable buy-back model',
                },
                {
                  icon: Heart,
                  title: 'Support for SHGs',
                  description: 'Collaborating with Self-Help Groups to foster community development',
                },
                {
                  icon: Leaf,
                  title: 'Consumer Health',
                  description: 'Nutrient-rich products free from preservatives and additives',
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="h-full"
                >
                  <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-white/90 backdrop-blur-sm border border-beige-200/50 shadow-xl">
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-300 flex items-center justify-center shadow-soft">
                            <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-russet-800" />
                          </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-heading font-bold text-russet-800">
                          {benefit.title}
                        </h3>
                      </div>
                      <div className="flex-1 flex items-center">
                        <p className="text-base sm:text-lg text-russet-600 leading-relaxed font-medium">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-beige-300 to-beige-400 w-full">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
              Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="h-full"
              >
                <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${value.color}`}>
                        <value.icon className="w-6 h-6 text-white-50" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-heading font-bold text-black-900">{value.title}</h3>
                    </div>
                    <div className="flex-1 flex items-center">
                      <p className="text-base sm:text-lg text-black-700 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      {/* <section className="py-16 sm:py-20 bg-gradient-to-br from-green-200 to-green-300 w-full">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
              Key <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Achievements</span>
            </h2>
            <p className="text-lg text-black-700 max-w-2xl mx-auto">
              Milestones that reflect our commitment to excellence and community impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 sm:p-6 rounded-xl bg-beige-300/80 backdrop-blur-sm border border-beige-400/50"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white-50" />
                  </div>
                </div>
                <p className="text-lg text-black-700 leading-relaxed">{achievement}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-beige-500 to-beige-600 w-full">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative p-8 sm:p-12 rounded-3xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-beige-100/50 to-green-100/30 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-full bg-green-600">
                    <Heart className="w-8 h-8 text-white-50" />
                  </div>
                </div>
                <h2 className="text-4xl font-heading font-bold text-black-900 mb-6">
                  Join Our Mission
                </h2>
                <p className="text-xl text-black-700 mb-8 leading-relaxed">
                  Be part of a movement that empowers farmers, promotes sustainability, and delivers premium natural products to your doorstep
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    <span className="flex items-center space-x-2">
                      <span>Explore Products</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                  <Link
                    to="/products"
                    className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Learn More</span>
                      <Star className="w-5 h-5" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 