import { profileApi, type ProfileResponse, type ProfileUpdateRequest, type ProfileImageResponse } from './api';

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  profile_picture_url: string;
  profile_picture_s3_key: string;
  bio: string;
  newsletter_subscribed: boolean;
  preferred_language: string;
  is_active: boolean;
  is_verified: boolean;
}

export class ProfileService {
  /**
   * Get user profile
   * @returns Promise with profile data
   */
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await profileApi.getProfile();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw new Error('Failed to fetch profile. Please try again later.');
    }
  }

  /**
   * Update user profile
   * @param profileData - Profile data to update
   * @returns Promise with updated profile data
   */
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<UserProfile> {
    try {
      const response = await profileApi.updateProfile(profileData);
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile. Please try again later.');
    }
  }

  /**
   * Upload profile picture
   * @param imageFile - Image file to upload
   * @returns Promise with upload response
   */
  static async uploadProfileImage(imageFile: File): Promise<ProfileImageResponse> {
    try {
      const response = await profileApi.uploadProfileImage(imageFile);
      return response;
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw new Error('Failed to upload profile image. Please try again later.');
    }
  }

  /**
   * Get full name from profile
   * @param profile - Profile data
   * @returns Full name string
   */
  static getFullName(profile: UserProfile): string {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  }

  /**
   * Get display name (first name or full name)
   * @param profile - Profile data
   * @returns Display name string
   */
  static getDisplayName(profile: UserProfile): string {
    return profile.first_name || profile.last_name || 'User';
  }

  /**
   * Check if profile is complete
   * @param profile - Profile data
   * @returns Boolean indicating if profile is complete
   */
  static isProfileComplete(profile: UserProfile): boolean {
    return !!(profile.first_name && profile.phone && profile.address_line_1 && profile.city && profile.pincode);
  }

  /**
   * Get profile completion percentage
   * @param profile - Profile data
   * @returns Percentage (0-100)
   */
  static getProfileCompletionPercentage(profile: UserProfile): number {
    const requiredFields = [
      'first_name',
      'phone',
      'address_line_1',
      'city',
      'pincode',
      'gender',
      'date_of_birth'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value && value.toString().trim() !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
}

export default ProfileService;
