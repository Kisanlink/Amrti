import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Edit3, MapPin, Phone, Mail, Calendar, User as UserIcon } from 'lucide-react';
import ProfileService, { type UserProfile } from '../services/profileService';
import AuthService from '../services/authService';
import { useNotification } from '../context/NotificationContext';

const Profile: React.FC = () => {
  const { showNotification } = useNotification();
  const [user, setUser] = useState(AuthService.getCurrentUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Debug log for formData state
  useEffect(() => {
    console.log('Form data state changed:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('Profile component mounted, user:', user);
    
    // Check if user is authenticated
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && !user) {
      setUser(currentUser);
    }
    
    // Only load profile if user is authenticated
    if (AuthService.isAuthenticated()) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!AuthService.isAuthenticated()) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }
      
      const profileData = await ProfileService.getProfile();
      console.log('Profile data loaded:', profileData); // Debug log
      
      setProfile(profileData);
      
      const initialFormData = {
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone || '',
        date_of_birth: profileData.date_of_birth || '',
        gender: profileData.gender || '',
        address_line_1: profileData.address_line_1 || '',
        address_line_2: profileData.address_line_2 || '',
        city: profileData.city || '',
        state: profileData.state || '',
        country: profileData.country || '',
        pincode: profileData.pincode || '',
        bio: profileData.bio || '',
        newsletter_subscribed: profileData.newsletter_subscribed || false,
        preferred_language: profileData.preferred_language || 'en'
      };
      
      console.log('Setting initial form data:', initialFormData); // Debug log
      setFormData(initialFormData);
      
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    console.log('Input change:', name, value, type); // Debug log
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const newData = { ...prev, [name]: checked };
        console.log('New form data (checkbox):', newData); // Debug log
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        console.log('New form data (text):', newData); // Debug log
        return newData;
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const updatedProfile = await ProfileService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      showNotification({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      
      const response = await ProfileService.uploadProfileImage(file);
      setProfile(prev => prev ? { ...prev, profile_picture_url: response.image_url } : null);
      showNotification({ type: 'success', message: 'Profile picture uploaded successfully!' });
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Failed to upload profile picture. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAutoFill = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await ProfileService.autoFillProfile();
      setProfile(profileData);
      showNotification({ type: 'success', message: 'Profile auto-filled successfully!' });
      await loadProfile(); // Reload to get updated data
    } catch (err) {
      console.error('Failed to auto-fill profile:', err);
      setError('Failed to auto-fill profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">🔒</div>
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <a
            href="/login"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">👤</div>
          <p className="text-gray-600 mb-4">No profile found</p>
          <button
            onClick={handleAutoFill}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const completionPercentage = ProfileService.getProfileCompletionPercentage(profile);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your account information</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    <span className="sm:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-xs sm:text-sm text-gray-500">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="relative mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-green-600 text-white p-1.5 sm:p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {ProfileService.getFullName(profile)}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 break-all">{profile.email}</p>
              {isUploading && (
                <p className="text-xs sm:text-sm text-green-600 mt-1">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* First Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                placeholder="Enter last name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Preferred Language
              </label>
              <select
                name="preferred_language"
                value={formData.preferred_language || 'en'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Address Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Address Line 1 */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Address Line 1 *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address_line_1"
                    value={formData.address_line_1 || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                    placeholder="Enter address line 1"
                  />
                </div>
              </div>

              {/* Address Line 2 */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_line_2"
                  value={formData.address_line_2 || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  placeholder="Enter address line 2 (optional)"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  placeholder="Enter city"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  placeholder="Enter state"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country || 'India'}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  placeholder="Enter country"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Additional Information</h3>
            
            {/* Bio */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Newsletter Subscription */}
            <div className="flex items-start">
              <input
                type="checkbox"
                name="newsletter_subscribed"
                checked={formData.newsletter_subscribed || false}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50 mt-0.5"
              />
              <label className="ml-2 block text-xs sm:text-sm text-gray-700 leading-relaxed">
                Subscribe to newsletter for updates and offers
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
