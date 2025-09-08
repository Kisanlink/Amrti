import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReviewService, { type Review } from '../../services/reviewService';

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopRatedMoringaReviews = async () => {
      try {
        setLoading(true);
        // Get fallback reviews and filter for top-rated ones
        const fallbackReviews = ReviewService.getFallbackReviews();
        // Sort by rating (highest first) and take top 3
        const topRatedReviews = fallbackReviews
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setReviews(topRatedReviews);
      } catch (error) {
        console.error('Failed to load top-rated moringa reviews:', error);
        // Use fallback reviews sorted by rating
        const fallbackReviews = ReviewService.getFallbackReviews();
        const topRatedReviews = fallbackReviews
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setReviews(topRatedReviews);
      } finally {
        setLoading(false);
      }
    };

    loadTopRatedMoringaReviews();
  }, []);

  // Fallback testimonials for when API fails
  const fallbackTestimonials = [
    {
      name: 'Amit Sharma',
      role: 'Wellness Enthusiast',
      image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      rating: 5,
      text: 'Excellent product quality! The moringa powder is pure and authentic. I\'ve been using it for my morning smoothies and noticed improved energy levels. Highly recommended!'
    },
    {
      name: 'Priya Kumar',
      role: 'Health Coach',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      rating: 5,
      text: 'Great organic moringa powder. The packaging is excellent and the product quality is outstanding. Will definitely buy again!'
    },
    {
      name: 'Rajesh Patel',
      role: 'Fitness Trainer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      rating: 5,
      text: 'I recommend Amrti\'s moringa powder to all my clients. It\'s packed with nutrients and helps with post-workout recovery. The quality is exceptional!'
    },
    {
      name: 'Anjali Singh',
      role: 'Nutritionist',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      rating: 5,
      text: 'As a nutritionist, I appreciate the organic quality of Amrti\'s moringa products. They\'re my go-to recommendation for natural superfood supplements.'
    },
    {
      name: 'Suresh Reddy',
      role: 'Yoga Instructor',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      rating: 5,
      text: 'The moringa powder has become an essential part of my wellness routine. It\'s pure, potent, and I love knowing it supports sustainable farming practices.'
    },
    {
      name: 'Meera Verma',
      role: 'Health Blogger',
      image: 'https://images.unsplash.com/photo-1594824047379-4ca84ee855ad?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
      rating: 5,
      text: 'I\'ve tried many moringa products, but Amrti stands out for their commitment to quality and authenticity. The powder is fresh and potent!'
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-heading font-bold text-black-900 mb-4">
            Top-Rated <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">Moringa</span> Reviews
          </h2>
          <p className="text-lg text-black-700 max-w-3xl mx-auto">
            See what our customers are saying about our premium moringa products - featuring our highest-rated reviews
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="animate-pulse">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))
          ) : reviews.length > 0 ? (
            // Dynamic reviews from API
            reviews.slice(0, 3).map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {/* Quote Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-yellow-600">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-center text-gray-700 mb-6 leading-relaxed font-medium">
                  "{review.comment}"
                </p>

                {/* Customer Info */}
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 font-semibold text-sm">
                      {review.user_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{review.user_name}</h4>
                  <div className="flex items-center justify-center space-x-2">
                    {review.is_verified && (
                      <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                    <span className="text-xs text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded-full">
                      Top Rated
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Fallback testimonials
            fallbackTestimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-yellow-600">
                    {testimonial.rating}.0
                  </span>
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-center text-gray-700 mb-6 leading-relaxed font-medium">
                "{testimonial.text}"
              </p>

              {/* Customer Info */}
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{testimonial.name}</h4>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                    Verified
                  </span>
                  <span className="text-xs text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded-full">
                    Top Rated
                  </span>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection; 