import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Plus, Trash2, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useUploadRecipeImage, useSubmitRecipe } from '../hooks/queries/useRecipeSubmission';
import type { RecipeSubmissionRequest } from '../services/recipeSubmissionService';
import { useNotification } from '../context/NotificationContext';
import AuthService from '../services/authService';
import LoginRequiredModal from '../components/ui/LoginRequiredModal';

const RecipeSubmission: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<RecipeSubmissionRequest>({
    name: '',
    category: '',
    description: '',
    demo_description: '',
    prep_time: '',
    servings: 0,
    difficulty: '',
    image: '',
    ingredients: [''],
    instructions: [''],
    nutrition_facts: {
      calories: '',
      fat: '',
      carbs: '',
      protein: '',
    },
    pro_tips: [''],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploadedS3Key, setUploadedS3Key] = useState<string>('');

  // React Query hooks
  const uploadImageMutation = useUploadRecipeImage();
  const submitRecipeMutation = useSubmitRecipe();

  // Check authentication on mount
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
    }
  }, []);

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('nutrition_')) {
      const field = name.replace('nutrition_', '');
      setFormData(prev => ({
        ...prev,
        nutrition_facts: {
          ...prev.nutrition_facts,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'servings' ? parseInt(value) || 0 : value,
      }));
    }
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showNotification({
        type: 'error',
        message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showNotification({
        type: 'error',
        message: 'File size exceeds 10MB limit.',
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!imageFile) {
      showNotification({
        type: 'error',
        message: 'Please select an image first.',
      });
      return;
    }

    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await uploadImageMutation.mutateAsync(imageFile);
      setUploadedImageUrl(response.image_url);
      setUploadedS3Key(response.s3_key);
      setFormData(prev => ({ ...prev, image: response.image_url }));
      
      showNotification({
        type: 'success',
        message: 'Image uploaded successfully!',
      });
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl('');
    setUploadedS3Key('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Handle add ingredient
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ''],
    }));
  };

  // Handle remove ingredient
  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // Handle ingredient change
  const handleIngredientChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => (i === index ? value : ing)),
    }));
  };

  // Handle add instruction
  const handleAddInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  // Handle remove instruction
  const handleRemoveInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  // Handle instruction change
  const handleInstructionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => (i === index ? value : inst)),
    }));
  };

  // Handle add pro tip
  const handleAddProTip = () => {
    setFormData(prev => ({
      ...prev,
      pro_tips: [...prev.pro_tips, ''],
    }));
  };

  // Handle remove pro tip
  const handleRemoveProTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pro_tips: prev.pro_tips.filter((_, i) => i !== index),
    }));
  };

  // Handle pro tip change
  const handleProTipChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pro_tips: prev.pro_tips.map((tip, i) => (i === index ? value : tip)),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!AuthService.isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.category || !formData.description || !formData.image) {
      showNotification({
        type: 'error',
        message: 'Please fill in all required fields (Name, Category, Description, and Image).',
      });
      return;
    }

    if (!formData.prep_time || formData.servings === 0 || !formData.difficulty) {
      showNotification({
        type: 'error',
        message: 'Please fill in prep time, servings, and difficulty.',
      });
      return;
    }

    if (formData.ingredients.filter(i => i.trim()).length === 0) {
      showNotification({
        type: 'error',
        message: 'Please add at least one ingredient.',
      });
      return;
    }

    if (formData.instructions.filter(i => i.trim()).length === 0) {
      showNotification({
        type: 'error',
        message: 'Please add at least one instruction.',
      });
      return;
    }

    // Filter out empty ingredients, instructions, and pro_tips
    const submissionData: RecipeSubmissionRequest = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.trim()),
      instructions: formData.instructions.filter(i => i.trim()),
      pro_tips: formData.pro_tips.filter(t => t.trim()),
      // Use description as demo_description if not provided
      demo_description: formData.demo_description || formData.description,
    };

    try {
      const response = await submitRecipeMutation.mutateAsync(submissionData);
      
      showNotification({
        type: 'success',
        message: 'Recipe submitted for review successfully!',
      });
      
      // Navigate to my submissions page
      navigate('/my-submissions');
    } catch (error) {
      console.error('Recipe submission failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-6 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 sm:p-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Submit Your Recipe</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-green-600" />
                Recipe Image *
              </h2>
              
              {!uploadedImageUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-64 mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, WEBP up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {imageFile && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={uploadImageMutation.isPending}
                      className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {uploadImageMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="max-h-64 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Image uploaded successfully
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Chocolate Chip Cookies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Snack">Snack</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time *
                </label>
                <input
                  type="text"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 30 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Describe your recipe..."
              />
            </div>

            {/* Demo Description (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demo Description (Optional)
              </label>
              <textarea
                name="demo_description"
                value={formData.demo_description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Optional: A more detailed description for display..."
              />
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredients *
                </label>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </button>
              </div>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Instructions *
                </label>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              </div>
              <div className="space-y-2">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                      {index + 1}
                    </span>
                    <textarea
                      value={instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Step ${index + 1}`}
                    />
                    {formData.instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(index)}
                        className="text-red-600 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Facts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Nutrition Facts (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Calories</label>
                  <input
                    type="text"
                    name="nutrition_calories"
                    value={formData.nutrition_facts?.calories || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 120"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fat</label>
                  <input
                    type="text"
                    name="nutrition_fat"
                    value={formData.nutrition_facts?.fat || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 6g"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Carbs</label>
                  <input
                    type="text"
                    name="nutrition_carbs"
                    value={formData.nutrition_facts?.carbs || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 15g"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Protein</label>
                  <input
                    type="text"
                    name="nutrition_protein"
                    value={formData.nutrition_facts?.protein || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 2g"
                  />
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Pro Tips (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleAddProTip}
                  className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Tip</span>
                </button>
              </div>
              <div className="space-y-2">
                {formData.pro_tips.map((tip, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => handleProTipChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={`Tip ${index + 1}`}
                    />
                    {formData.pro_tips.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProTip(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitRecipeMutation.isPending || !uploadedImageUrl}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitRecipeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit for Review</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      
      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login to submit a recipe"
        redirectUrl="/recipe-submission"
      />
    </div>
  );
};

export default RecipeSubmission;

