import { apiClient } from '@/api';

/**
 * Get the proper URL for an image based on its path
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The complete URL to access the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg";
  
  // If it's already a full URL or starts with http, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('/api')) {
    return imagePath;
  }
  
  // If it's a path like /uploads/profiles/file.jpg, prepend the API base URL
  if (imagePath.startsWith('/uploads')) {
    return `${apiClient.defaults.baseURL}${imagePath}`;
  }
  
  // If it's just a filename (for boss images), construct the full path
  if (!imagePath.includes('/')) {
    return `${apiClient.defaults.baseURL}/uploads/bosses/${imagePath}`;
  }
  
  // Default: prepend API base URL
  return `${apiClient.defaults.baseURL}${imagePath}`;
};

/**
 * Get the proper URL for a boss image
 * @param {string} imageFilename - The boss image filename from the database
 * @returns {string} - The complete URL to access the boss image
 */
export const getBossImageUrl = (imageFilename) => {
  if (!imageFilename) return "/placeholder.svg";
  return `${apiClient.defaults.baseURL}/uploads/bosses/${imageFilename}`;
};

/**
 * Get the proper URL for a profile image
 * @param {string} imagePath - The profile image path from the database
 * @returns {string} - The complete URL to access the profile image
 */
export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg";
  return `${apiClient.defaults.baseURL}${imagePath}`;
};
