import api from './api';

/**
 * Authentication Service
 * Handles all backend communication for user authentication and authorization.
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - Registration payload (role, name, email, phone, password, employeeId, department, skills, resume)
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login user with credentials and selected role
   * @param {string} email
   * @param {string} password
   * @param {string} role - 'admin' | 'candidate' | 'employee'
   */
  async login(email, password, role) {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Upload resume file (PDF, DOC, DOCX, TXT)
   * @param {File} file
   */
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post('/auth/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch {
      return { success: true };
    }
  },
};

export default authService;
