import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  Package,
  TrendingUp,
  Shield,
  X,
  Eye,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  LogOut,
  Menu,
  BarChart3,
  ShoppingCart,
  Receipt,
} from 'lucide-react';
import AuthService from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';
import LoginRequiredModal from '../../components/ui/LoginRequiredModal';
import { 
  usePendingReviews, 
  useDeleteReview, 
  useReviewById, 
  useApproveRecipe, 
  useRejectRecipe,
  type PendingReviewsResponse,
  type ReviewDetailResponse,
} from '../../hooks/queries/useAdminRecipes';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  setStatusFilter,
  setSearchQuery,
  setSelectedReviewId as setSelectedReviewIdAction,
} from '../../store/slices/adminRecipesSlice';
import type { RecipeReview } from '../../services/adminRecipeService';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'reviews' | 'orders' | 'users' | 'analytics' | 'settings'>('reviews');
  const [showReviewDetailModal, setShowReviewDetailModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get state from Redux
  const { statusFilter: statusFilterState, searchQuery: searchQueryState } = useAppSelector(
    (state) => state.adminRecipes
  );
  const statusFilter = statusFilterState === 'all' ? undefined : statusFilterState;

  // Fetch reviews
  const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = usePendingReviews(
    1,
    10,
    statusFilter
  );
  const deleteReviewMutation = useDeleteReview();
  
  // Fetch review details when selected
  const { data: reviewData, isLoading: isLoadingReview, error: reviewError } = useReviewById(
    selectedReviewId || ''
  );
  const approveMutation = useApproveRecipe();
  const rejectMutation = useRejectRecipe();

  // Check authentication and role
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // Check user role
    const role = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');
    let parsedRole = role;
    
    if (!parsedRole && userData) {
      try {
        const user = JSON.parse(userData);
        parsedRole = user.role;
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    setUserRole(parsedRole);

    // If not admin, redirect to home
    if (parsedRole !== 'Admin') {
      showNotification({
        type: 'error',
        message: 'You do not have permission to access the admin portal.'
      });
      navigate('/', { replace: true });
    }
  }, [navigate, showNotification]);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login', { replace: true });
  };

  const handleViewReview = (reviewId: string) => {
    if (!reviewId) return;
    setSelectedReviewId(reviewId);
    dispatch(setSelectedReviewIdAction(reviewId));
    setShowReviewDetailModal(true);
  };

  const handleApprove = async () => {
    if (!selectedReviewId) return;
    try {
      await approveMutation.mutateAsync(selectedReviewId);
      showNotification({
        type: 'success',
        message: 'Recipe approved successfully!'
      });
      setShowReviewDetailModal(false);
      setSelectedReviewId(null);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Failed to approve recipe'
      });
    }
  };

  const handleReject = async () => {
    if (!selectedReviewId || !rejectionReason.trim()) {
      showNotification({
        type: 'error',
        message: 'Please provide a rejection reason'
      });
      return;
    }
    try {
      await rejectMutation.mutateAsync({ reviewId: selectedReviewId, reason: rejectionReason });
      showNotification({
        type: 'success',
        message: 'Recipe rejected successfully!'
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setShowReviewDetailModal(false);
      setSelectedReviewId(null);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Failed to reject recipe'
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReviewMutation.mutateAsync(reviewId);
        showNotification({
          type: 'success',
          message: 'Review deleted successfully!'
        });
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
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

  const responseData = reviewsData as PendingReviewsResponse | undefined;
  
  const filteredReviews = responseData?.reviews.filter((review: RecipeReview) => {
    if (!searchQueryState) return true;
    const query = searchQueryState.toLowerCase();
    return (
      review.name.toLowerCase().includes(query) ||
      review.category.toLowerCase().includes(query) ||
      review.description.toLowerCase().includes(query)
    );
  }) || [];

  const reviews = responseData?.reviews || [];
  const pendingCount = reviews.filter((r: RecipeReview) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r: RecipeReview) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r: RecipeReview) => r.status === 'rejected').length;

  if (!AuthService.isAuthenticated() || userRole !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 sm:pt-24 pb-6 sm:pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading admin portal...</p>
        </div>
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message="Please login as admin to access the admin portal"
          redirectUrl="/admin/portal"
        />
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, active: activeView === 'dashboard', comingSoon: true },
    { id: 'reviews', label: 'Recipe Reviews', icon: FileText, active: activeView === 'reviews', comingSoon: false },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, active: activeView === 'orders', comingSoon: true },
    { id: 'users', label: 'Users', icon: Users, active: activeView === 'users', comingSoon: true },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, active: activeView === 'analytics', comingSoon: true },
    { id: 'settings', label: 'Settings', icon: Settings, active: activeView === 'settings', comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-base font-bold text-slate-900">Admin Portal</h1>
                  <p className="text-xs text-slate-500">Control Center</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!item.comingSoon) {
                    setActiveView(item.id as any);
                  }
                }}
                disabled={item.comingSoon}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left relative ${
                  item.active
                    ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
                    : item.comingSoon
                    ? 'text-slate-400 cursor-not-allowed opacity-60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.comingSoon && (
                      <span className="ml-auto text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded">Soon</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 text-center">
            {sidebarOpen && <p>Admin Portal</p>}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-4">
              <p className="text-sm font-medium text-slate-900">Admin</p>
              <p className="text-xs text-slate-500">Control Panel</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeView === 'dashboard' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white shadow-lg mb-6">
                <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                <p className="text-slate-300">Comprehensive overview coming soon</p>
              </div>
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Dashboard Coming Soon</h3>
                  <p className="text-slate-600">This feature is under development</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'reviews' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Recipe Reviews</h2>
                    <p className="text-sm text-slate-600">Review, approve, or reject submitted recipes</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search recipes..."
                      value={searchQueryState}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                      value={statusFilterState}
                      onChange={(e) => {
                        const value = e.target.value as 'pending' | 'approved' | 'rejected' | 'all';
                        dispatch(setStatusFilter(value));
                      }}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Cards - Compact Design */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {/* Pending */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => dispatch(setStatusFilter('pending'))}
                  className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
                </motion.div>

                {/* Approved */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => dispatch(setStatusFilter('approved'))}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
                </motion.div>

                {/* Rejected */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => dispatch(setStatusFilter('rejected'))}
                  className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Rejected</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
                    {reviews.length > 0 && (
                      <span className="text-xs text-red-600 font-medium">
                        {Math.round((rejectedCount / reviews.length) * 100)}%
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Total */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Total</p>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-slate-900">{reviews.length}</p>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </motion.div>
              </div>

              {/* Reviews Cards Grid */}
              <div>
                {isLoadingReviews ? (
                  <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-600">Loading reviews...</span>
                  </div>
                ) : reviewsError ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Failed to load reviews</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reviews Found</h3>
                    <p className="text-slate-600">
                      {statusFilterState !== 'all' ? `No ${statusFilterState} reviews at the moment.` : 'No reviews found.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.map((review: RecipeReview, index: number) => (
                      <motion.div
                        key={review.review_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group cursor-pointer"
                        onClick={() => handleViewReview(review.review_id)}
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {review.image ? (
                            <img
                              src={review.image}
                              alt={review.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-16 h-16 text-slate-300" />
                            </div>
                          )}
                          {/* Status Badge Overlay */}
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(review.status)}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex-1 mb-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{review.name}</h3>
                            <p className="text-sm text-slate-600 mb-2">
                              {review.category} • {review.difficulty}
                            </p>
                            {review.demo_description && (
                              <p className="text-sm text-slate-700 mb-3 line-clamp-2">{review.demo_description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{review.prep_time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{review.servings} servings</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              <span className="font-medium">Submitted:</span> {formatDate(review.submitted_at)}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleViewReview(review.review_id);
                            }}
                            className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm hover:shadow font-medium text-sm flex items-center justify-center space-x-2 z-10 relative"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Coming Soon Views */}
          {['orders', 'users', 'analytics', 'settings'].includes(activeView) && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white shadow-lg mb-6">
                <h2 className="text-3xl font-bold mb-2">{menuItems.find(m => m.id === activeView)?.label}</h2>
                <p className="text-slate-300">This feature is coming soon</p>
              </div>
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                <div className="text-center py-12">
                  {activeView === 'orders' && <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
                  {activeView === 'users' && <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
                  {activeView === 'analytics' && <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
                  {activeView === 'settings' && <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />}
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Coming Soon</h3>
                  <p className="text-slate-600">This feature is under development</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review Detail Modal */}
      <AnimatePresence>
        {showReviewDetailModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowReviewDetailModal(false);
                setSelectedReviewId(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-8 lg:inset-12 z-[60] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const reviewResponse = reviewData as ReviewDetailResponse | undefined;
                        const review = reviewResponse?.review;
                        return review ? (
                          <>
                            <h2 className="text-xl font-bold text-white truncate">{review.name}</h2>
                            <p className="text-xs text-slate-300">ID: {review.review_id}</p>
                          </>
                        ) : (
                          <>
                            <h2 className="text-xl font-bold text-white truncate">Loading...</h2>
                            <p className="text-xs text-slate-300">ID: {selectedReviewId}</p>
                          </>
                        );
                      })()}
                    </div>
                    {(() => {
                      const reviewResponse = reviewData as ReviewDetailResponse | undefined;
                      const review = reviewResponse?.review;
                      return review ? (
                        <div className="ml-3 flex-shrink-0">
                          {getStatusBadge(review.status)}
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <button
                    onClick={() => {
                      setShowReviewDetailModal(false);
                      setSelectedReviewId(null);
                    }}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center ml-3 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  {isLoadingReview ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-600">Loading review details...</span>
                    </div>
                  ) : reviewError ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">Failed to load review details</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (() => {
                    const reviewResponse = reviewData as ReviewDetailResponse | undefined;
                    const review = reviewResponse?.review;
                    return review ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Image & Quick Info */}
                        <div className="lg:col-span-1 space-y-4">
                          {/* Small Image */}
                          {review.image && (
                            <div className="rounded-lg overflow-hidden shadow-md border border-slate-200 bg-white">
                              <img
                                src={review.image}
                                alt={review.name}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          )}

                          {/* Quick Stats */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600">Prep Time</span>
                              </div>
                              <span className="font-semibold text-slate-900">{review.prep_time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600">Servings</span>
                              </div>
                              <span className="font-semibold text-slate-900">{review.servings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600">Difficulty</span>
                              </div>
                              <span className="font-semibold text-slate-900">{review.difficulty}</span>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Category:</span>
                              <span className="font-medium text-slate-900">{review.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Submitted:</span>
                              <span className="font-medium text-slate-900">{formatDate(review.submitted_at)}</span>
                            </div>
                            {review.reviewed_at && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Reviewed:</span>
                                <span className="font-medium text-slate-900">{formatDate(review.reviewed_at)}</span>
                              </div>
                            )}
                            {review.reviewed_by && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Reviewed By:</span>
                                <span className="font-medium text-slate-900">{review.reviewed_by}</span>
                              </div>
                            )}
                          </div>

                          {/* Nutrition Facts */}
                          {review.nutrition_facts && (
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <h3 className="text-sm font-bold text-slate-900 mb-3">Nutrition Facts</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(review.nutrition_facts).map(([key, value]: [string, any]) => (
                                  <div key={key} className="text-center p-2 bg-slate-50 rounded">
                                    <p className="text-xs text-slate-600 capitalize mb-1">{key.replace('_', ' ')}</p>
                                    <p className="text-sm font-bold text-slate-900">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Details */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* Description */}
                          <div className="bg-white rounded-lg p-5 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
                            <p className="text-slate-700 leading-relaxed text-sm">{review.description}</p>
                            {review.demo_description && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Demo Description</p>
                                <p className="text-slate-700 leading-relaxed text-sm">{review.demo_description}</p>
                              </div>
                            )}
                          </div>

                          {/* Ingredients & Instructions Side by Side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ingredients */}
                            {review.ingredients && review.ingredients.length > 0 && (
                              <div className="bg-white rounded-lg p-5 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-3">Ingredients</h3>
                                <ul className="space-y-2">
                                  {review.ingredients.map((ingredient: string, index: number) => (
                                    <li key={index} className="flex items-start space-x-2 text-sm">
                                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-slate-700 flex-1">{ingredient}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Instructions */}
                            {review.instructions && review.instructions.length > 0 && (
                              <div className="bg-white rounded-lg p-5 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-3">Instructions</h3>
                                <ol className="space-y-3">
                                  {review.instructions.map((instruction: string, index: number) => (
                                    <li key={index} className="flex items-start space-x-3 text-sm">
                                      <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                                        {index + 1}
                                      </div>
                                      <span className="text-slate-700 flex-1 leading-relaxed pt-0.5">{instruction}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>

                          {/* Pro Tips */}
                          {review.pro_tips && review.pro_tips.length > 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                Pro Tips
                              </h3>
                              <ul className="space-y-2">
                                {review.pro_tips.map((tip: string, index: number) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-slate-700 flex-1">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {review.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                              <h3 className="text-base font-bold text-red-900 mb-2 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Rejection Reason
                              </h3>
                              <p className="text-red-800 text-sm">{review.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null;
                  })()}
                </div>

                {/* Actions Footer */}
                {(() => {
                  const reviewResponse = reviewData as ReviewDetailResponse | undefined;
                  const review = reviewResponse?.review;
                  return review && review.status === 'pending' ? (
                  <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        setShowReviewDetailModal(false);
                        setSelectedReviewId(null);
                      }}
                      className="px-6 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm border border-slate-200"
                    >
                      Close
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={rejectMutation.isPending || approveMutation.isPending}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="inline-flex items-center space-x-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                  ) : null;
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-8 lg:inset-24 z-[70] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Reject Recipe</h3>
                <p className="text-slate-600 mb-4 text-sm">Please provide a reason for rejecting this recipe:</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-slate-900"
                  autoFocus
                />
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || rejectMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm"
                  >
                    {rejectMutation.isPending ? 'Rejecting...' : 'Reject Recipe'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login as admin to access the admin portal"
        redirectUrl="/admin/portal"
      />
    </div>
  );
};

export default AdminPortal;
