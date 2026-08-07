// Frontend Integration Guide for SafeStay Backend

// 1. LOGIN PAGE INTEGRATION (login.html)
// =====================================

// Inject this into your login page script section:
/*
function handleLoginSubmit(email, password) {
  safeStayAPI.login(email, password)
    .then(response => {
      console.log('Login successful:', response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      // Redirect to home page
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    });
}

function handleRegisterSubmit(email, password, fullName) {
  safeStayAPI.register(email, password, fullName)
    .then(response => {
      console.log('Registration successful');
      alert('Registration successful! Please log in.');
      // Redirect to login form
    })
    .catch(error => {
      console.error('Registration failed:', error);
      alert('Registration failed: ' + error.message);
    });
}
*/

// 2. CASE LISTING PAGE INTEGRATION (index.html)
// ===============================================

// Load and display all user's cases:
/*
async function loadCases() {
  try {
    const response = await safeStayAPI.getAllCases();
    const cases = response.cases;
    
    // Display cases in your UI
    cases.forEach(caseItem => {
      // Create case card with:
      // - caseItem.case_title
      // - caseItem.case_status
      // - caseItem.urgency_level
      // - caseItem.detected_case
      // - caseItem.probability
      // - caseItem.created_at
    });
  } catch (error) {
    console.error('Failed to load cases:', error);
  }
}

// Load cases when page loads
document.addEventListener('DOMContentLoaded', loadCases);
*/

// 3. DESCRIBE CASE PAGE INTEGRATION (describe.html)
// ==================================================

// Create new case:
/*
async function handleCreateCase() {
  const categoryId = document.getElementById('categoryId').value;
  const caseTitle = document.getElementById('caseTitle').value;
  const description = document.getElementById('description').value;
  const location = document.getElementById('location').value;
  const urgencyLevel = document.getElementById('urgencyLevel').value;
  
  try {
    const response = await safeStayAPI.createCase(
      categoryId,
      caseTitle,
      description,
      location,
      urgencyLevel,
      'To be determined',  // detected_case
      0                    // probability
    );
    
    const caseId = response.case_id;
    // Redirect to result page with case_id
    window.location.href = `result.html?case_id=${caseId}`;
  } catch (error) {
    console.error('Failed to create case:', error);
    alert('Failed to create case: ' + error.message);
  }
}
*/

// 4. RESULT PAGE INTEGRATION (result.html)
// ==========================================

// Load case details and evidence:
/*
async function loadCaseResult() {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('case_id');
  
  try {
    const response = await safeStayAPI.getCase(caseId);
    const caseData = response.case;
    
    // Display case information:
    // - caseData.detected_case
    // - caseData.probability
    // - caseData.case_title
    // - caseData.description
    // - caseData.urgency_level
    // - caseData.case_status
    
    // Display evidence files:
    response.evidence.forEach(file => {
      // - file.file_name
      // - file.file_type
      // - file.file_path
      // - file.uploaded_at
    });
    
    // Display checklist:
    response.checklist.forEach(item => {
      // - item.item_name
      // - item.is_completed
    });
  } catch (error) {
    console.error('Failed to load case:', error);
  }
}

// Upload evidence file:
async function handleFileUpload(file, description) {
  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get('case_id');
  
  try {
    const response = await safeStayAPI.uploadEvidence(caseId, file, description);
    console.log('File uploaded:', response.evidence_id);
    // Reload case to show new file
    loadCaseResult();
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Upload failed: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', loadCaseResult);
*/

// 5. CATEGORIES DROPDOWN
// =======================

// Load categories for the describe page:
/*
async function loadCategories() {
  try {
    const response = await safeStayAPI.getCategories();
    const selectElement = document.getElementById('categoryId');
    
    response.categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.category_id;
      option.textContent = category.category_name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}
*/

// 6. SETUP INSTRUCTIONS
// ====================

/*
To use the API in your HTML pages:

1. Add the api.js script to your HTML head:
   <script src="api.js"></script>

2. Make sure backend is running:
   cd backend
   npm start
   (Backend should run on http://localhost:5000)

3. Update the API_BASE_URL in api.js if your backend runs on a different port

4. Use safeStayAPI methods in your JavaScript code

5. For form submissions, call the appropriate API method

6. Handle tokens - they're automatically saved to localStorage

7. Check if user is logged in:
   if (safeStayAPI.token) {
     // User is logged in
   } else {
     // Redirect to login
     window.location.href = 'login.html';
   }
*/

// 7. COMMON PATTERNS
// ==================

// Check authentication before showing page
function requireAuth() {
  if (!safeStayAPI.token) {
    window.location.href = 'login.html';
  }
}

// Logout
function logout() {
  safeStayAPI.clearToken();
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Error handling
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
}

// Success message
function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 3000);
  }
}
