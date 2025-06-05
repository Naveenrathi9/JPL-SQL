document.addEventListener('DOMContentLoaded', function() {
   // Redirect to login if token is missing
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  // Session timeout: auto logout after 15 minutes (900000 ms)
  let logoutTimer = setTimeout(() => {
    alert("Session expired. You will be logged out.");
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }, 900000); // 15 minutes

  // Optional: reset timer on user activity
  const resetTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      alert("Session expired. You will be logged out.");
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }, 900000);
  };

  // Listen for user activity events to reset timer
  ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimer);
  });

  const requestHistoryButton = document.getElementById('requestHistoryButton');
  const requestHistoryModal = document.getElementById('requestHistoryModal');
  const closeRequestHistoryModalBtn = document.getElementById('closeRequestHistoryModal');

  // Load and display request history
  async function loadRequestHistory() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Please login to view request history.');
      window.location.href = 'login.html';
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/requests/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response status:', response.status);
      const requests = await response.json();
      console.log('Requests:', requests); // Should be an array

      const tbody = document.querySelector('#requestHistoryTable tbody');
      tbody.innerHTML = '';

      if (!Array.isArray(requests) || requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:10px;">No request history found.</td></tr>';
        return;
      }

      [...requests].reverse().forEach(request => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${request._id ? request._id.slice(-4) : ''}</td>
          <td>${request.item || ''}</td>
          <td>${request.status?.hod || 'N/A'}</td>
          <td>${request.status?.hr || 'N/A'}</td>
          <td>${request.status?.ithod || 'N/A'}</td>
          <td>${new Date(request.createdAt).toLocaleString() || ''}</td>
        `;
        tbody.appendChild(tr);
      });

    } catch (error) {
      console.error('Error loading request history:', error);
      alert('Failed to load request history. Please try again later.');
    }
  }

  // Open request history modal
  if (requestHistoryButton) {
    requestHistoryButton.addEventListener('click', () => {
      if (requestHistoryModal) {
        requestHistoryModal.classList.add('active');
        console.log('Request history modal opened');
        loadRequestHistory();
      }
    });
  }

  // Close modal with close button
  if (closeRequestHistoryModalBtn) {
    closeRequestHistoryModalBtn.addEventListener('click', () => {
      console.log('Close button clicked');
      if (requestHistoryModal) {
        requestHistoryModal.classList.remove('active');
        console.log('Request history modal closed');
      }
    });
  }

  // Close modal when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target === requestHistoryModal) {
      requestHistoryModal.classList.remove('active');
      console.log('Request history modal closed by outside click');
    }
  });

  // Filter request history table
  const requestHistorySearch = document.getElementById('requestHistorySearch');
  if (requestHistorySearch) {
    requestHistorySearch.addEventListener('input', () => {
      const filter = requestHistorySearch.value.toLowerCase();
      const rows = document.querySelectorAll('#requestHistoryTable tbody tr');
      rows.forEach(row => {
        const item = row.cells[1].textContent.toLowerCase();
        const statusHOD = row.cells[2].textContent.toLowerCase();
        const statusHR = row.cells[3].textContent.toLowerCase();
        const statusIT = row.cells[4].textContent.toLowerCase();
        if (
          item.includes(filter) ||
          statusHOD.includes(filter) ||
          statusHR.includes(filter) ||
          statusIT.includes(filter)
        ) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  // Existing code continues here...

  // Logout button handler
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }


  // Form navigation
  const formSections = document.querySelectorAll('.form-section');
  const progressSteps = document.querySelectorAll('.progress-step');
  const btnNext = document.querySelectorAll('.btn-next');
  const btnPrev = document.querySelectorAll('.btn-prev');
  const submitButton = document.getElementById('submitButton');
  const successModal = document.getElementById('successModal');
  const printReceipt = document.getElementById('printReceipt');
  const newRequest = document.getElementById('newRequest');
  const charCount = document.getElementById('charCount');
  const reasonTextarea = document.getElementById('reason');
  
  // HOD Email mapping
  const hodEmail = {
   "Unit Head Office": "br.rao@jindalpower.com",
    "Operation & Maintenance": "gajendrarawat@jindalpower.com",
    "Operations, Chemistry": "subirbiswas@jindalpower.com",
    "Coal Quality Management": "navneet.singh@jindalpower.com",
    "Boiler Maintenance": "rajarshi.gupta@jindalpower.com",
    "Turbine & Auxiliaries": "subrata.adak@jindalpower.com",
    "CHP, AHP, Bio Mass, Ash Management": "nandkishore.singh@jindalpower.com",
    "Electrical": "arun.narayan@jindalpower.com",
    "Control & Instrumentation": "gobardhan@jindalpower.com",
    "Technical Services": "birendra.singh@jindalpower.com",
    "Coal Management Group": "neerajchaubey@jindalpower.com",
    "Ash management": "sanjeev.parashari@jindalpower.com",
    "LAQ": "sanjaykumar.singh@jindalpower.com",
    "Finance & Accounts": "ajay.kanchhal@jindalpower.com",
    "HR ES CSR Medical, Town Maint": "sandeep.sangwan@jindalpower.com",
    "Admin": "sudeep@jindalpower.com",
    "HR": "ram.pandey@jindalpower.com",
    "Medical": "saroj.pujari@jindalpower.com",
    "Corporate HR": "ashish.kumar1@jindalpower.com",
    "CSR": "rishikesh.sharma@jindalpower.com",
    "Information Technology": "shivanshrawat2003@gmail.com",
    "MM&C": "rudraprasad.misra@jindalpower.com",
    "EHS": "shiv.singh@jindalpower.com",
    "Solar, Mechanical Project, Civil, Plant Horticulture": "krishnendu.chattopadhyay@jindalpower.com",
    "Electrical Project, TL": "rkshrivastava@jindalpower.com",
    "Mines and CPP": "om.prakash@jindalpower.com",
    "JIPT": "sanjiv.kumar@jindalpower.com",
    "IV/1": "vijay.jain@jindalpower.com",
    "Sector 1 E": "rajesh.dubey@jindalpower.com",
    "IV/2-3": "rajesh.dubey@jindalpower.com",
    "Security": "cso.jpl@jindalpower.com",
  };

  // Designations that qualify for Special Allowance
  const specialAllowanceDesignations = [
    "Others",
    "Apprentice",
    "Junior Engineer",
    "Assistant Engineer" 
  ];

  let currentSection = 0;

  // Show first section by default
  showSection(currentSection);

  // Auto-fill HOD email
  document.getElementById("department").addEventListener("change", function() {
    const selectedDept = this.value;
    const hodEmailInput = document.getElementById("hodEmail");
    hodEmailInput.value = hodEmail[selectedDept] || "";
  });

  // Set and lock Special Allowance based on designation
  document.querySelector('select[name="designation"]').addEventListener('change', function() {
    const designation = this.value;
    const radioYes = document.querySelector('input[name="specialAllowance"][value="YES"]');
    const radioNo = document.querySelector('input[name="specialAllowance"][value="NO"]');
    const radioGroup = document.querySelector('.radio-group');
    
    // Check if designation qualifies for special allowance
    const qualifiesForAllowance = specialAllowanceDesignations.includes(designation);
    
    // Set the value and disable the radio buttons
    radioYes.checked = qualifiesForAllowance;
    radioNo.checked = !qualifiesForAllowance;
    radioYes.disabled = true;
    radioNo.disabled = true;
    
    // Add visual indication that field is auto-set
    if (qualifiesForAllowance) {
      radioGroup.classList.add('allowance-yes');
      radioGroup.classList.remove('allowance-no');
    } else {
      radioGroup.classList.add('allowance-no');
      radioGroup.classList.remove('allowance-yes');
    }
  });

  // Initialize designation on page load
  const designationSelect = document.querySelector('select[name="designation"]');
  if (designationSelect.value) {
    designationSelect.dispatchEvent(new Event('change'));
  }

  // Next button click handler
  btnNext.forEach(btn => {
    btn.addEventListener('click', function() {
      if (validateSection(currentSection)) {
        currentSection++;
        showSection(currentSection);
        updateProgress();
      }
    });
  });

  // Previous button click handler
  btnPrev.forEach(btn => {
    btn.addEventListener('click', function() {
      currentSection--;
      showSection(currentSection);
      updateProgress();
    });
  });

  // Character counter for reason textarea
  if (reasonTextarea) {
    reasonTextarea.addEventListener('input', function() {
      charCount.textContent = this.value.length;
    });
  }

  // Form submission handler
  if (submitButton) {
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (validateSection(currentSection)) {
        submitForm();
      }
    });
  }

  // Print receipt button
  if (printReceipt) {
    printReceipt.addEventListener('click', function() {
      window.print();
    });
  }

  // New request button
  if (newRequest) {
    newRequest.addEventListener('click', function() {
      successModal.classList.remove('active');
      currentSection = 0;
      showSection(currentSection);
      updateProgress();
      document.getElementById('requestForm').reset();
      charCount.textContent = '0';
      document.getElementById('hodEmail').value = '';
      
      // Reset radio buttons
      const radioYes = document.querySelector('input[name="specialAllowance"][value="YES"]');
      const radioNo = document.querySelector('input[name="specialAllowance"][value="NO"]');
      const radioGroup = document.querySelector('.radio-group');
      radioYes.checked = false;
      radioNo.checked = true;
      radioYes.disabled = false;
      radioNo.disabled = false;
      radioGroup.classList.remove('allowance-yes', 'allowance-no');
    });
  };

  function getProfileFromDOM() {
    return {
      name: document.getElementById('regName')?.textContent.trim() || '',
      employeeCode: document.getElementById('userEmployeeCode')?.textContent.trim() || '',
      email: document.getElementById('regEmail')?.textContent.trim() || '',
      department: document.getElementById('userDepartment')?.textContent.trim() || '',
      contactNumber: document.getElementById('userContactNumber')?.textContent.trim() || ''
      // Add more fields as needed
    };
  }

  const requestedBySelf = document.querySelector('input[name="requestedBy"][value="self"]');
  const requestedByBehalf = document.querySelector('input[name="requestedBy"][value="behalf"]');
  const nameInput = document.getElementById('name');
  const employeeCodeInput = document.getElementById('employeeCode');
  const emailInput = document.getElementById('email');
  const departmentInput = document.getElementById('department');
  const contactNumberInput = document.getElementById('contactNumber');
  const hodEmailInput = document.getElementById('hodEmail');

  function setSelfMode() {
    const profile = getProfileFromDOM();
    console.log('Profile in setSelfMode:', profile);
    nameInput.value = profile.name;
    employeeCodeInput.value = profile.employeeCode;
    emailInput.value = profile.email;
    departmentInput.value = profile.department;
    contactNumberInput.value = profile.contactNumber;

    // Dispatch change event on department to update HOD email
    const event = new Event('change');
    departmentInput.dispatchEvent(event);

    nameInput.readOnly = true;
    employeeCodeInput.readOnly = true;
    emailInput.readOnly = true;
    departmentInput.disabled = true;
    contactNumberInput.readOnly = true;
  }

  function setBehalfMode() {
    nameInput.value = '';
    employeeCodeInput.value = '';
    emailInput.value = '';
    departmentInput.value = '';
    contactNumberInput.value = '';
    
    nameInput.readOnly = false;
    employeeCodeInput.readOnly = false;
    emailInput.readOnly = false;
    departmentInput.disabled = false;
    contactNumberInput.readOnly = false;
    hodEmailInput.value = '';
    hodEmailInput.readOnly = false;
  }

  // --- Place this after the above ---
  if (requestedBySelf && requestedBySelf.checked) {
    requestedBySelf.dispatchEvent(new Event('change'));
    // Additional delayed call to ensure data is set after any async loading
    setTimeout(() => {
      console.log('Delayed setSelfMode call on page load');
      setSelfMode();
    }, 500);
  }

  // Event listeners
  if (requestedBySelf) {
    requestedBySelf.addEventListener('change', function() {
      if (this.checked) setSelfMode();
    });
  }
  if (requestedByBehalf) {
    requestedByBehalf.addEventListener('change', function() {
      if (this.checked) setBehalfMode();
    });
  }

  // Add input event listener to empCode to limit input length to 10 characters
  const empCode = document.getElementById('employeeCode');
  if (empCode) {
    empCode.addEventListener('input', function() {
      if (this.value.length > 10) {
        this.value = this.value.substring(0, 10);
      }
    });
  }

  // Show specific section
  function showSection(index) {
    formSections.forEach((section, i) => {
      section.classList.toggle('active', i === index);
    });
    
    // Update review section if we're on the review step
    if (index === 2) {
      updateReviewSection();
    }
  }

  // Update progress indicator
  function updateProgress() {
    progressSteps.forEach((step, i) => {
      step.classList.toggle('active', i <= currentSection);
    });
  }

  // Validate current section
  function validateSection(index) {
    const currentSection = formSections[index];
    const inputs = currentSection.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
      }
    });
    
    // Validate name length if provided
    const nameInput = document.getElementById('name');
    if (nameInput && nameInput.value.length > 30) {
      alert('Name must be at most 30 characters long');
      isValid = false;
    }
    
    // Validate employee code length if provided
    const employeeCodeInput = document.getElementById('employeeCode');
    if (employeeCodeInput && employeeCodeInput.value.length > 10) {
      alert('Employee code must be at most 10 characters long');
      isValid = false;
    }
    
    // Validate contact number format if provided (exactly 10 digits)
    const contactNumber = document.getElementById('contactNumber');
    if (contactNumber && contactNumber.value) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(contactNumber.value)) {
        alert('Please enter a valid contact number (exactly 10 digits)');
        isValid = false;
      }
    }
    
    if (!isValid) {
      alert('Please fill in all required fields correctly');
    }
    
    return isValid;
  }

  // Update review section with entered data
  function updateReviewSection() {
    const personalInfoReview = document.getElementById('personalInfoReview');
    const equipmentReview = document.getElementById('equipmentReview');
    
    // Personal Info
    let personalInfoHTML = `
      <div class="review-details">
        <div class="review-field">
          <label>Name</label>
          <p>${document.getElementById('name').value}</p>
        </div>
        <div class="review-field">
          <label>Employee Code</label>
          <p>${document.getElementById('employeeCode').value}</p>
        </div>
        <div class="review-field">
          <label>Designation</label>
          <p>${document.getElementById('designation').value}</p>
        </div>
        <div class="review-field">
          <label>Special Exception</label>
          <p>${document.querySelector('input[name="specialAllowance"]:checked').value}</p>
        </div>
        <div class="review-field">
          <label>User Email</label>
          <p>${document.getElementById('email').value}</p>
        </div>
        <div class="review-field">
          <label>Department</label>
          <p>${document.getElementById('department').value}</p>
        </div>
        <div class="review-field">
          <label>HOD Email</label>
          <p>${document.getElementById('hodEmail').value}</p>
        </div>
        <div class="review-field">
          <label>Location</label>
          <p>${document.getElementById('location').value}</p>
        </div>
        <div class="review-field">
          <label>Address</label>
          <p>${document.getElementById('address').value}</p>
        </div>
        <div class="review-field">
          <label>Contact Number</label>
          <p>${document.getElementById('contactNumber').value}</p>
        </div>
        <div class="review-field">
          <label>Alternate Contact</label>
          <p>${document.getElementById('alternateContactNumber').value || 'N/A'}</p>
        </div>
      </div>
    `;
    
    // Equipment Details
    let equipmentHTML = `
      <div class="review-details">
        <div class="review-field">
          <label>Selected Item</label>
          <p>${document.getElementById('item').value}</p>
        </div>
        <div class="review-field full-width">
          <label>Reason</label>
          <p>${document.getElementById('reason').value || 'N/A'}</p>
        </div>
      </div>
    `;
    
    personalInfoReview.innerHTML = personalInfoHTML;
    equipmentReview.innerHTML = equipmentHTML;
  }

  // Submit form data
  async function submitForm() {
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitButton.disabled = true;

    const token = localStorage.getItem('token');
    console.log('Token before submission:', token);

    if (!token) {
      alert('You are not logged in. Please login to submit the form.');
      window.location.href = 'login.html';
      return;
    }

    // Decode JWT token to check expiry
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
        return;
      }
    } catch (err) {
      console.error('Error decoding token:', err);
      alert('Invalid session token. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return;
    }
    
    const form = document.getElementById('requestForm');
    const formData = {
      name: form.name.value,
      employeeCode: form.employeeCode.value,
      designation: form.designation.value,
      email: form.email.value,
      department: form.department.value,
      location: form.location.value,
      specialAllowance: document.querySelector('input[name="specialAllowance"]:checked').value,
      requestedBy: document.querySelector('input[name="requestedBy"]:checked').value,
      item: form.item.value,
      reason: form.reason.value,
      hodEmail: form.hodEmail.value,
      address: form.address.value,
      contactNumber: form.contactNumber.value,
      alternateContactNumber: form.alternateContactNumber.value || null
    };

    console.log('Submitting form data:', formData);

    try {
      // const BASE_URL = "https://asset-jpl-backend.onrender.com";
      const BASE_URL = "http://localhost:5000";
      const response = await fetch(`${BASE_URL}/api/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          alert('Session expired or user not found. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = 'login.html';
          return;
        }

        const errorData = await response.text();
        let errorMessage = 'Submission failed';
        
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || jsonError.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success response:', result);

      successModal.classList.add('active');
      const strongElem = document.querySelector('#successModal strong');
      if (strongElem) {
        strongElem.textContent = result.requestId || 'IT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${err.message || 'Failed to submit request. Please try again.'}</span>
      `;
      
      const formActions = document.querySelector('.form-navigation');
      if (formActions) {
        if (submitButton.nextSibling && submitButton.nextSibling.parentNode === formActions) {
          formActions.insertBefore(errorDiv, submitButton.nextSibling);
        } else {
          formActions.appendChild(errorDiv);
        }
      } else {
        document.querySelector('.form-container').appendChild(errorDiv);
      }
      
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
      
    } finally {
      submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
      submitButton.disabled = false;
    }
  }
});
