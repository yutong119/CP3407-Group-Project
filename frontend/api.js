// SafeStay Frontend API Service
// This file handles all API calls to the backend

const API_BASE_URL = (() => {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  const host = window.location.hostname || 'localhost';
  return `${protocol}//${host}:5001/api`;
})();

function isMobileDevice() {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024)
  );
}

function handlePhoneCall(phoneNumber, contactName) {
  if (!phoneNumber) {
    if (typeof window.showCallMessage === 'function') {
      window.showCallMessage('No phone number is available for this contact.');
    }
    return;
  }

  const normalizedNumber = String(phoneNumber).replace(/[^\d+*#]/g, '');

  if (isMobileDevice()) {
    window.location.href = `tel:${normalizedNumber}`;
    return;
  }

  if (typeof window.showCallMessage === 'function') {
    window.showCallMessage(
      `To call ${contactName || 'this contact'} at ${phoneNumber}, please open SafeStay on your mobile phone.`,
      phoneNumber,
      contactName
    );
  }
}

class SafeStayAPI {
  constructor() {
    this.token = localStorage.getItem('token') || null;
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear token on logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Helper method for API calls
  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== AUTH ENDPOINTS =====
  async register(email, password, fullName, preferredLanguage = 'English') {
    return this.request('/auth/register', 'POST', {
      email,
      password,
      full_name: fullName,
      preferred_language: preferredLanguage
    });
  }

  async login(email, password) {
    const data = await this.request('/auth/login', 'POST', { email, password });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // ===== USER ENDPOINTS =====
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(fullName, preferredLanguage) {
    return this.request('/users/profile', 'PUT', {
      full_name: fullName,
      preferred_language: preferredLanguage
    });
  }

  async changePassword(oldPassword, newPassword) {
    return this.request('/users/change-password', 'POST', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  // ===== CASE ENDPOINTS =====
  async getAllCases() {
    return this.request('/cases');
  }

  async getCase(caseId) {
    return this.request(`/cases/${caseId}`);
  }

  async getCaseReport(caseId) {
    return this.request(`/cases/${caseId}/report`);
  }

  async createCase(categoryId, caseTitle, description, location, urgencyLevel, detectedCase, probability) {
    return this.request('/cases', 'POST', {
      category_id: categoryId,
      case_title: caseTitle,
      description,
      location,
      urgency_level: urgencyLevel,
      detected_case: detectedCase,
      probability
    });
  }

  async updateCase(caseId, caseStatus, urgencyLevel, detectedCase, probability) {
    return this.request(`/cases/${caseId}`, 'PUT', {
      case_status: caseStatus,
      urgency_level: urgencyLevel,
      detected_case: detectedCase,
      probability
    });
  }

  async deleteCase(caseId) {
    return this.request(`/cases/${caseId}`, 'DELETE');
  }

  async updateChecklist(caseId, items) {
    return this.request(`/cases/${caseId}/checklist`, 'PUT', {
      items
    });
  }

  // ===== EVIDENCE ENDPOINTS =====
  async uploadEvidence(caseId, file, description = '') {
    const formData = new FormData();
    formData.append('case_id', caseId);
    formData.append('file', file);
    formData.append('description', description);

    try {
      const response = await fetch(`${API_BASE_URL}/evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  async getEvidenceFiles(caseId) {
    return this.request(`/evidence/case/${caseId}`);
  }

  async deleteEvidence(evidenceId) {
    return this.request(`/evidence/${evidenceId}`, 'DELETE');
  }

  // ===== ANALYSIS ENDPOINT =====
  async analyzeCase(description, location) {
    return this.request('/analyze', 'POST', { description, location });
  }

  // ===== CATEGORY ENDPOINTS =====
  async getCategories() {
    return this.request('/categories');
  }

  async getCategory(categoryId) {
    return this.request(`/categories/${categoryId}`);
  }
}

// Create global instance
const safeStayAPI = new SafeStayAPI();
window.isMobileDevice = isMobileDevice;
window.handlePhoneCall = handlePhoneCall;