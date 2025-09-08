import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ThumbsUp, User, Verified, Trash2 } from 'lucide-react';
import ReviewService, { type Review } from '../../services/reviewService';
import { useNotification } from '../../context/NotificationContext';
import AuthService from '../../services/authService';

interface ReviewCardProps {
  review: Review;
  productId?: string;
  showProductInfo?: boolean;
  onLikeUpdate?: (reviewId: string, likesCount: number, hasUserLiked: boolean) => void;
  onDelete?: (reviewId: string) => void;
}

const ReviewCard = ({ review, productId, showProductInfo = false, onLikeUpdate, onDelete }: ReviewCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotification();

  // Debug logging
  console.log('ReviewCard render:', { 
    reviewId: review.id, 
    hasUserLiked: review.is_user_liked, 
    likesCount: review.likes_count,
    productId,
    buttonClass: review.is_user_liked ? 'LIKED (should be blue)' : 'NOT LIKED (should be gray)',
    fullReview: review
  });

  const handleDelete = async () => {
    if (!productId || isDeleting) return;

    // Check if this is a fallback review
    if (review.id.startsWith('fallback-')) {
      showNotification({
        type: 'error',
        message: 'Cannot delete demo reviews'
      });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await ReviewService.deleteReview(productId, review.id);
      
      if (onDelete) {
        onDelete(review.id);
      }

      showNotification({
        type: 'success',
        message: 'Review deleted successfully!'
      });
    } catch (error) {
      console.error('Failed to delete review:', error);
      showNotification({
        type: 'error',
        message: 'Failed to delete review. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!productId || isLiking) return;

    // Check if this is a fallback review (starts with 'fallback-')
    if (review.id.startsWith('fallback-')) {
      console.log('Fallback review - simulating like action');
      // For fallback reviews, just simulate the like action locally
      const newLikedState = !review.is_user_liked;
      const newLikesCount = newLikedState ? review.likes_count + 1 : Math.max(0, review.likes_count - 1);
      
      if (onLikeUpdate) {
        console.log('Calling onLikeUpdate for fallback review:', { reviewId: review.id, newLikesCount, newLikedState });
        onLikeUpdate(review.id, newLikesCount, newLikedState);
      } else {
        console.log('onLikeUpdate callback not provided');
      }

      showNotification({
        type: 'success',
        message: `Review ${newLikedState ? 'liked' : 'unliked'} successfully!`
      });
      return;
    }

    setIsLiking(true);
    try {
      const action = review.is_user_liked ? 'unlike' : 'like';
      console.log('Liking review:', { reviewId: review.id, action, currentState: review.is_user_liked });
      
      const result = await ReviewService.likeReview(productId, review.id, action);
      console.log('Like result:', result);
      
      // Update the review data
      if (onLikeUpdate) {
        console.log('Calling onLikeUpdate for API review:', { reviewId: review.id, result });
        onLikeUpdate(review.id, result.likes_count, result.is_user_liked);
      } else {
        console.log('onLikeUpdate callback not provided for API review');
      }

      // Show success message (even if API returned success: false, we still got the current state)
      showNotification({
        type: 'success',
        message: `Review ${result.is_user_liked ? 'liked' : 'unliked'} successfully!`
      });
    } catch (error) {
      console.error('Failed to like review:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update review. Please try again.'
      });
    } finally {
      setIsLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
              {review.is_verified && (
                <Verified className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">{formatDate(review.review_date)}</p>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {productId && (
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                review.is_user_liked
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <ThumbsUp 
                className={`w-4 h-4 ${review.is_user_liked ? 'fill-current text-blue-600' : 'text-gray-500'}`} 
                style={review.is_user_liked ? { 
                  fill: '#2563eb',
                  color: '#2563eb'
                } : { 
                  fill: 'none',
                  color: '#6b7280'
                }} 
              />
              <span>{review.likes_count}</span>
            </button>
          )}
          
          {/* Delete button - only show for current user's reviews */}
          {productId && onDelete && AuthService.getUserId() === review.user_id && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          )}
        </div>
        
        {showProductInfo && (
          <div className="text-sm text-gray-500">
            Product ID: {review.product_id}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewCard;
