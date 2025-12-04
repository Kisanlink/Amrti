import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  Eye,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePendingReviews, useDeleteReview } from '../../hooks/queries/useAdminRecipes';
import type { RecipeReview, PendingReviewsResponse } from '../../services/adminRecipeService';
import AuthService from '../../services/authService';
import LoginRequiredModal from '../../components/ui/LoginRequiredModal';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  setCurrentPage,
  setStatusFilter,
  setSearchQuery,
  goToNextPage,
  goToPrevPage,
  setSelectedReviewId,
  removeCachedReview,
} from '../../store/slices/adminRecipesSlice';

const AdminPendingRecipes: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Get state from Redux
  const { currentPage, pageSize, statusFilter: statusFilterState, searchQuery: searchQueryState } = useAppSelector(
    (state) => state.adminRecipes
  );
  
  // Convert 'all' to undefined for API
  const statusFilter = statusFilterState === 'all' ? undefined : statusFilterState;

  const { data, isLoading, error } = usePendingReviews(currentPage, pageSize, statusFilter);
  const deleteReviewMutation = useDeleteReview();
  
  // Type assertion for TypeScript
  const responseData = data as PendingReviewsResponse | undefined;

  // Check authentication
  React.useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReviewMutation.mutateAsync(reviewId);
        // Remove from Redux cache
        dispatch(removeCachedReview(reviewId));
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const handleViewDetails = (reviewId: string) => {
    dispatch(setSelectedReviewId(reviewId));
    navigate(`/admin/reviews/${reviewId}`);
  };

  const reviews = responseData?.reviews || [];
  const filteredReviews = reviews.filter((review: RecipeReview) => {
    if (!searchQueryState) return true;
    const query = searchQueryState.toLowerCase();
    return (
      review.name.toLowerCase().includes(query) ||
      review.category.toLowerCase().includes(query) ||
      review.description.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading pending reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load pending reviews</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pagination = responseData?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-green-600 hover:text-green-700 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recipe Reviews</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Manage and review submitted recipes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQueryState}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilterState}
                onChange={(e) => {
                  const value = e.target.value as 'pending' | 'approved' | 'rejected' | 'all';
                  dispatch(setStatusFilter(value));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {pagination && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600 mb-1">Total Reviews</div>
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600 mb-1">Current Page</div>
              <div className="text-2xl font-bold text-gray-900">{pagination.page} / {pagination.total_pages}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600 mb-1">Showing</div>
              <div className="text-2xl font-bold text-gray-900">{reviews.length} reviews</div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {statusFilter ? `No ${statusFilter} reviews at the moment.` : 'No reviews found.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review: RecipeReview, index: number) => (
              <motion.div
                key={review.review_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {review.image ? (
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-full lg:w-48 h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full lg:w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{review.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {review.category} • {review.difficulty} • {review.prep_time} • {review.servings} servings
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(review.status)}
                      </div>
                    </div>

                    {review.demo_description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{review.demo_description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                      <div>
                        <span className="font-medium">Submitted:</span> {formatDate(review.submitted_at)}
                      </div>
                      {review.reviewed_at && (
                        <div>
                          <span className="font-medium">Reviewed:</span> {formatDate(review.reviewed_at)}
                        </div>
                      )}
                      {review.reviewed_by && (
                        <div>
                          <span className="font-medium">Reviewed by:</span> {review.reviewed_by}
                        </div>
                      )}
                    </div>

                    {review.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Rejection Reason:</span> {review.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleViewDetails(review.review_id)}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      {review.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(review.review_id)}
                          disabled={deleteReviewMutation.isPending}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(goToPrevPage())}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {pagination.total_pages}
              </span>
              <button
                onClick={() => dispatch(goToNextPage())}
                disabled={currentPage === pagination.total_pages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login as admin to access recipe reviews"
        redirectUrl="/admin/reviews"
      />
    </div>
  );
};

export default AdminPendingRecipes;

