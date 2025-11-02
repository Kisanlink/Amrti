import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Users,
  TrendingUp,
  Leaf,
  AlertCircle,
  FileText,
  Trash2,
} from 'lucide-react';
import { useReviewById, useApproveRecipe, useRejectRecipe, useDeleteReview } from '../../hooks/queries/useAdminRecipes';
import AuthService from '../../services/authService';
import LoginRequiredModal from '../../components/ui/LoginRequiredModal';
import { useNotification } from '../../context/NotificationContext';

const AdminReviewDetail: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading, error } = useReviewById(reviewId || '');
  const approveMutation = useApproveRecipe();
  const rejectMutation = useRejectRecipe();
  const deleteMutation = useDeleteReview();

  const review = data?.review;

  // Check authentication
  React.useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
    }
  }, []);

  const handleApprove = async () => {
    if (!reviewId) return;

    if (window.confirm('Are you sure you want to approve this recipe? It will be published and visible to all users.')) {
      try {
        await approveMutation.mutateAsync(reviewId);
        // Navigate back to pending reviews after approval
        setTimeout(() => {
          navigate('/admin/reviews');
        }, 1500);
      } catch (error) {
        console.error('Failed to approve recipe:', error);
      }
    }
  };

  const handleReject = async () => {
    if (!reviewId || !rejectionReason.trim()) {
      showNotification({
        type: 'error',
        message: 'Please provide a reason for rejection.',
      });
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        reviewId,
        reason: rejectionReason,
      });
      setShowRejectModal(false);
      setRejectionReason('');
      // Navigate back to pending reviews after rejection
      setTimeout(() => {
        navigate('/admin/reviews');
      }, 1500);
    } catch (error) {
      console.error('Failed to reject recipe:', error);
    }
  };

  const handleDelete = async () => {
    if (!reviewId) return;

    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(reviewId);
        // Navigate back to pending reviews after deletion
        setTimeout(() => {
          navigate('/admin/reviews');
        }, 1500);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading review details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load review details</p>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (review.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/admin/reviews')}
            className="flex items-center text-green-600 hover:text-green-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviews
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recipe Review</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Review ID: {review.review_id}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 sm:p-8"
        >
          {/* Image */}
          <div className="mb-6">
            {review.image ? (
              <img
                src={review.image}
                alt={review.name}
                className="w-full h-64 sm:h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 sm:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{review.name}</h2>
              <p className="text-lg text-gray-600 mb-4">{review.category} • {review.difficulty}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900">{review.prep_time}</p>
                <p className="text-xs text-gray-600">Prep Time</p>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900">{review.servings}</p>
                <p className="text-xs text-gray-600">Servings</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-semibold text-gray-900">{review.difficulty}</p>
                <p className="text-xs text-gray-600">Difficulty</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{review.description}</p>
            </div>

            {review.demo_description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Demo Description</h3>
                <p className="text-gray-700">{review.demo_description}</p>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Leaf className="w-5 h-5 mr-2 text-green-600" />
                Ingredients
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {review.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                {review.instructions.map((instruction, index) => (
                  <li key={index} className="ml-2">{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Nutrition Facts */}
            {review.nutrition_facts && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Facts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  {review.nutrition_facts.calories && (
                    <div>
                      <p className="text-xs text-gray-600">Calories</p>
                      <p className="text-sm font-semibold text-gray-900">{review.nutrition_facts.calories}</p>
                    </div>
                  )}
                  {review.nutrition_facts.fat && (
                    <div>
                      <p className="text-xs text-gray-600">Fat</p>
                      <p className="text-sm font-semibold text-gray-900">{review.nutrition_facts.fat}</p>
                    </div>
                  )}
                  {review.nutrition_facts.carbs && (
                    <div>
                      <p className="text-xs text-gray-600">Carbs</p>
                      <p className="text-sm font-semibold text-gray-900">{review.nutrition_facts.carbs}</p>
                    </div>
                  )}
                  {review.nutrition_facts.protein && (
                    <div>
                      <p className="text-xs text-gray-600">Protein</p>
                      <p className="text-sm font-semibold text-gray-900">{review.nutrition_facts.protein}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            {review.pro_tips && review.pro_tips.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pro Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {review.pro_tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Review Info */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Submitted:</span> {formatDate(review.submitted_at)}</p>
              {review.reviewed_at && (
                <p><span className="font-medium">Reviewed:</span> {formatDate(review.reviewed_at)}</p>
              )}
              {review.reviewed_by && (
                <p><span className="font-medium">Reviewed by:</span> {review.reviewed_by}</p>
              )}
            </div>

            {/* Rejection Reason */}
            {review.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Rejection Reason:</span> {review.rejection_reason}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        {review.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Recipe</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejectMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
            >
              <XCircle className="w-5 h-5" />
              <span>Reject Recipe</span>
            </button>

            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Review</span>
            </button>
          </motion.div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reject Recipe</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting this recipe:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              />
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject Recipe'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login as admin to access recipe reviews"
        redirectUrl={`/admin/reviews/${reviewId}`}
      />
    </div>
  );
};

export default AdminReviewDetail;

