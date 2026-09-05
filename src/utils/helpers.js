// frontend/src/utils/helpers.js

/**
 * Formats a given date string or Date object into a readable local string.
 * @param {string | Date} dateInput - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatReadableDate = (dateInput) => {
  if (!dateInput) {
    return 'N/A';
  }
  try {
    const date = new Date(dateInput);
    // You can customize the options for toLocaleString for different formats
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The input string.
 * @returns {string} The string with the first letter capitalized.
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
