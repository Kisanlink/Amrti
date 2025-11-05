import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { useMySubmissions } from '../hooks/queries/useRecipeSubmission';
import type { RecipeSubmission } from '../services/recipeSubmissionService';
import AuthService from '../services/authService';
import LoginRequiredModal from '../components/ui/LoginRequiredModal';
import { useState, useEffect } from 'react';

const MySubmissions: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { data, isLoading, error } = useMySubmissions();

  useEffect(() => {
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
            <span className="ml-2 text-gray-600">Loading your submissions...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load your submissions</p>
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

  const submissions = data?.submissions || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Recipe Submissions</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Track the status of your submitted recipes
              </p>
            </div>
            <button
              onClick={() => navigate('/recipe-submission')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Submit New Recipe</span>
            </button>
          </div>
        </motion.div>

        {submissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't submitted any recipes yet. Start by submitting your first recipe!
            </p>
            <button
              onClick={() => navigate('/recipe-submission')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Submit Your First Recipe</span>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission: RecipeSubmission, index: number) => (
              <motion.div
                key={submission.review_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {submission.image ? (
                      <img
                        src={submission.image}
                        alt={submission.name}
                        className="w-full sm:w-32 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {submission.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {submission.category} • {submission.difficulty}
                        </p>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>

                    {submission.demo_description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {submission.demo_description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Prep: {submission.prep_time}</span>
                      </div>
                      <div>
                        <span>Servings: {submission.servings}</span>
                      </div>
                      <div>
                        <span>Submitted: {formatDate(submission.submitted_at)}</span>
                      </div>
                      {submission.reviewed_at && (
                        <div>
                          <span>Reviewed: {formatDate(submission.reviewed_at)}</span>
                        </div>
                      )}
                    </div>

                    {submission.status === 'rejected' && submission.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Rejection Reason:</span>{' '}
                          {submission.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login to view your recipe submissions"
        redirectUrl="/my-submissions"
      />
    </div>
  );
};

export default MySubmissions;




