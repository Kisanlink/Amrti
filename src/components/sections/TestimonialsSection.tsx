import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Wellness Coach',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'Amrti\'s turmeric powder has transformed my daily wellness routine. The quality is exceptional and I can feel the difference in my energy levels.'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Fitness Trainer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'I recommend Amrti products to all my clients. The moringa powder is packed with nutrients and the kombucha is absolutely delicious!'
    },
    {
      name: 'Anjali Patel',
      role: 'Nutritionist',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'As a nutritionist, I appreciate the organic quality and transparency of Amrti products. They\'re my go-to recommendation for natural supplements.'
    },
    {
      name: 'Suresh Reddy',
      role: 'Yoga Instructor',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'The pomegranate kombucha is my favorite post-yoga drink. It\'s refreshing and I love knowing it supports local farmers.'
    },
    {
      name: 'Meera Singh',
      role: 'Health Blogger',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'I\'ve tried many natural products, but Amrti stands out for their commitment to quality and community impact. Highly recommend!'
    },
    {
      name: 'Arun Verma',
      role: 'Chef',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'I use Amrti powders in my cooking. The flavors are authentic and the quality is restaurant-grade. My customers love the dishes!'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-beige-400 to-beige-500">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
            What Our <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Customers</span> Say
          </h2>
          <p className="text-lg text-black-700 max-w-3xl mx-auto">
            Real stories from people who have transformed their wellness journey with Amrti products
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-600">
                  <Quote className="w-6 h-6 text-white-50" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-green-500 fill-current" />
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-black-700 text-center mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-black-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-black-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="p-8 rounded-2xl bg-beige-300/90 backdrop-blur-sm border border-beige-400/50 shadow-xl">
            <h3 className="text-2xl font-heading font-bold text-black-900 mb-4">
              Join Thousands of Satisfied Customers
            </h3>
            <p className="text-black-700 mb-6 max-w-2xl mx-auto">
              Experience the difference that premium natural products can make in your wellness journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white-50 font-heading font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-black-800 text-black-800 hover:bg-black-800 hover:text-white-50 font-heading font-semibold rounded-full transition-all duration-300"
              >
                Read More Reviews
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 