// const BASE_URL = "https://asset-jpl-backend.onrender.com";
const BASE_URL = "http://localhost:5000";

// Cache for modal instance
let commentModalInstance = null;

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "ithod_login.html";
    return false;
  }
  return true;
}

// Load and display requests
async function loadRequests() {
  if (!checkAuth()) return;

  try {
    console.log("Attempting to fetch requests from:", `${BASE_URL}/api/requests`);
    // Fetch requests from backend
    const response = await fetch(`${BASE_URL}/api/requests`);
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`);
    }

    const requests = await response.json();
    console.log("Loaded requests from backend:", requests);

    // Update localStorage with latest data
    localStorage.setItem("requests", JSON.stringify(requests));

    // Update UI
    updateStats(requests);
    
    // Check if modal is currently open
    const isModalOpen = document.querySelector('.modal.show') !== null;
    const currentModalId = isModalOpen ? document.querySelector('.modal.show').id : null;
    
    // Update the table
    displayRequests(requests);
    
    // If modal was open, restore it
    if (isModalOpen && currentModalId) {
      try {
        const modalElement = document.getElementById(currentModalId);
        if (modalElement) {
          // Clean up any other modals first
          cleanupExistingModals();
          // Re-add and show the modal
          document.body.appendChild(modalElement);
          const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false
          });
          modal.show();
        }
      } catch (modalError) {
        console.error('Error restoring modal:', modalError);
        cleanupExistingModals();
      }
    }
  } catch (error) {
    console.error("Error loading requests:", error);
    // Show error message to user
    const tbody = document.getElementById("requestsTableBody");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-danger">
                        <i class="fas fa-exclamation-circle"></i>
                        Failed to load requests. Please try again later.
                    </td>
                </tr>
            `;
    }
  }
}

// Update statistics
function updateStats(requests) {
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status_ithod === "pending").length,
    approved: requests.filter((r) => r.status_ithod === "approved").length,
    rejected: requests.filter((r) => r.status_ithod === "rejected").length,
  };

  document.getElementById("totalRequests").textContent = stats.total;
  document.getElementById("pendingRequests").textContent = stats.pending;
  document.getElementById("approvedRequests").textContent = stats.approved;
  document.getElementById("rejectedRequests").textContent = stats.rejected;
}

// Format status text
function formatStatus(status) {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Display requests in table
function displayRequests(requests, filter = "all") {
  console.log("Displaying requests:", requests, "with filter:", filter);
  const tbody = document.getElementById("requestsTableBody");
  if (!tbody) {
    console.error("Table body element not found");
    return;
  }
  tbody.innerHTML = "";

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r[`status_${filter}`] === filter);

  filteredRequests.forEach((request) => {
    // Determine if ITHOD buttons should be enabled
    const isHODApproved = request.status_hod === "approved";
    const isHRApproved = request.status_hr === "approved";
    const isITHODPending = request.status_ithod === "pending";
    const showITHODActions = isITHODPending && isHODApproved && isHRApproved;
    const disableITHODActions = isITHODPending && (!isHODApproved || !isHRApproved);

    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>
              <a href="#" class="request-id-link" data-id="${request.id}">
                #${request.id ? request.id.toString().slice(-4) : ""}
              </a>
            </td>
            <td>${request.name || ""}</td>
            <td>${request.department || ""}</td>
            <td>${request.location || ""}</td>
            <td>${request.item || ""}</td>
            <td>${request.specialAllowance || ""}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status_hod)}">
                    HOD: ${formatStatus(request.status_hod)}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status_hr)}">
                    HR: ${formatStatus(request.status_hr)}
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(request.status_ithod)}">
                    IT: ${formatStatus(request.status_ithod)}
                </span>
            </td>
            <td>
                ${
                  request.status_ithod === "pending"
                    ? `
                    <button class="btn btn-sm btn-outline-success action-btn approve" 
                            data-id="${request.id}" 
                            data-role="ithod"
                            ${disableITHODActions ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                        ${disableITHODActions ? ' (Pending Approvals)' : ''}
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn reject" 
                            data-id="${request.id}" 
                            data-role="ithod"
                            ${disableITHODActions ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                        ${disableITHODActions ? ' (Pending Approvals)' : ''}
                    </button>
                    ${
                      disableITHODActions 
                        ? '<div class="small text-muted mt-1">Requires HOD & HR approval first</div>' 
                        : ''
                    }
                `
                    : ""
                }
            </td>
        `;

    tbody.appendChild(tr);
  });

  // Add click handlers for request ID links
  document.querySelectorAll('.request-id-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      showRequestDetails(this.dataset.id);
    });
  });
}

// Helper function to clean up existing modals
function cleanupExistingModals() {
  try {
    // Remove all existing modals
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(modal => {
      try {
        // Hide the modal first if it's shown
        if (modal.classList.contains('show')) {
          modal.classList.remove('show');
          modal.style.display = 'none';
        }
        // Remove the modal from DOM
        modal.remove();
      } catch (modalError) {
        console.error('Error cleaning up modal:', modalError);
      }
    });

    // Remove all existing modal backdrops
    const existingBackdrops = document.querySelectorAll('.modal-backdrop');
    existingBackdrops.forEach(backdrop => {
      try {
        backdrop.remove();
      } catch (backdropError) {
        console.error('Error removing backdrop:', backdropError);
      }
    });

    // Reset body styles
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
    document.body.classList.remove('modal-open');
  } catch (error) {
    console.error('Error in cleanupExistingModals:', error);
  }
}

// Show request details in a modal
function showRequestDetails(requestId) {
  try {
    // Prevent multiple modals from being created
    if (document.querySelector('.modal.show')) {
      return;
    }

    // Clean up any existing modals first
    cleanupExistingModals();

    const requests = JSON.parse(localStorage.getItem("requests") || "[]");
    console.log("All requests:", requests);
    console.log("Looking for request with ID:", requestId);
    
    // Find the request by ID (handle both string and number IDs)
    const request = requests.find(r => {
      const storedId = r.id?.toString();
      const searchId = requestId.toString();
      console.log("Comparing IDs:", { storedId, searchId });
      return storedId === searchId;
    });

    if (!request) {
      console.error('Request not found for ID:', requestId);
      alert('Request details not found');
      return;
    }

    // Create modal HTML with proper data display
    const modalHTML = `
      <div class="modal fade" id="requestDetailsModal" tabindex="-1" aria-labelledby="requestDetailsModalLabel" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="requestDetailsModalLabel">Request Details - #${request.id}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="card mb-3">
                    <div class="card-header bg-grey text-black">
                      <h6>Personal Information</h6>
                    </div>
                    <div class="card-body">
                      <p><strong>Name:</strong> ${request.name || 'N/A'}</p>
                      <p><strong>Employee Code:</strong> ${request.employeeCode || 'N/A'}</p>
                      <p><strong>Department:</strong> ${request.department || 'N/A'}</p>
                      <p><strong>Location:</strong> ${request.location || 'N/A'}</p>
                      <p><strong>Email:</strong> ${request.email || 'N/A'}</p>
                      <p><strong>Contact:</strong> ${request.contactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card mb-3">
                    <div class="card-header bg-grey text-black">
                      <h6>Request Details</h6>
                    </div>
                    <div class="card-body">
                      <p><strong>Item Requested:</strong> ${request.item || 'N/A'}</p>
                      <p><strong>Address:</strong> ${request.address || 'N/A'}</p>
                      <p><strong>Special Allowance:</strong> ${request.specialAllowance || 'N/A'}</p>
                      <p><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
                      <p><strong>Date Requested:</strong> ${new Date(request.createdAt).toLocaleString() || 'N/A'}</p>
                      <p><strong>Alternate Contact:</strong> ${request.alternateContactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card">
                <div class="card-header bg-grey text-black">
                  <h6>Approval Status</h6>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div class="text-center">
                      <p class="mb-1"><strong>HOD</strong></p>
                      <span class="badge ${getStatusBadgeClass(request.status_hod)}">
                        ${formatStatus(request.status_hod)}
                      </span>
                    </div>
                    <div class="text-center">
                      <p class="mb-1"><strong>HR</strong></p>
                      <span class="badge ${getStatusBadgeClass(request.status_hr)}">
                        ${formatStatus(request.status_hr)}
                      </span>
                    </div>
                    <div class="text-center">
                      <p class="mb-1"><strong>IT</strong></p>
                      <span class="badge ${getStatusBadgeClass(request.status_ithod)}">
                        ${formatStatus(request.status_ithod)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mt-3">
                <div class="card-header bg-grey text-black">
                  <h6>Comments</h6>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <p class="mb-1"><strong>HOD Comment:</strong></p>
                    <p class="text-muted">${request.comments_hod || 'No comment'}</p>
                  </div>
                  <div class="mb-3">
                    <p class="mb-1"><strong>HR Comment:</strong></p>
                    <p class="text-muted">${request.comments_hr || 'No comment'}</p>
                  </div>
                  <div class="mb-3">
                    <p class="mb-1"><strong>IT Comment:</strong></p>
                    <p class="text-muted">${request.comments_ithod || 'No comment'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize and show the modal
    const modalElement = document.getElementById('requestDetailsModal');
    if (!modalElement) {
      console.error('Modal element not found after creation');
      return;
    }

    const modal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });
    
    // Add event listener for modal hidden event
    modalElement.addEventListener('hidden.bs.modal', function() {
      cleanupExistingModals();
    }, { once: true });

    modal.show();
  } catch (error) {
    console.error('Error in showRequestDetails:', error);
    cleanupExistingModals();
  }
}

// Get appropriate Bootstrap badge class for status
function getStatusBadgeClass(status) {
  if (!status) return "bg-secondary";

  switch (status.toLowerCase()) {
    case "pending":
      return "bg-warning text-dark";
    case "approved":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

// Handle request actions (approve, reject, delete)
async function handleAction(e) {
  if (!e.target.classList.contains("action-btn")) return;

  const button = e.target.closest(".action-btn");
  console.log("handleAction: button element:", button);
  const originalContent = button.innerHTML;
  
  // Show loading state
  button.disabled = true;
  button.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Processing...
  `;

  const requestId = button.dataset.id;
  const role = button.dataset.role;
  const action = button.classList.contains("approve") ? "approved" : "rejected";

  console.log(`handleAction: requestId=${requestId}, role=${role}, action=${action}`);

  try {
    // Show comment input modal
    const comment = await new Promise((resolve) => {
      // Create modal if it doesn't exist
      if (!commentModalInstance) {
        const modalHTML = `
          <div class="modal fade" id="commentModal" tabindex="-1">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Add Comment</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                  <div class="mb-3">
                    <label for="commentInput" class="form-label">Comment:</label>
                    <textarea class="form-control" id="commentInput" rows="3" required></textarea>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="button" class="btn btn-primary" id="submitComment">Submit</button>
                </div>
              </div>
            </div>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        commentModalInstance = new bootstrap.Modal(document.getElementById('commentModal'));
      }

      const modalElement = document.getElementById('commentModal');
      const submitBtn = document.getElementById('submitComment');
      const commentInput = document.getElementById('commentInput');

      // Clear previous comment
      commentInput.value = '';

      // Remove existing event listeners
      const newSubmitBtn = submitBtn.cloneNode(true);
      submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

      // Add new event listeners
      newSubmitBtn.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        if (comment) {
          commentModalInstance.hide();
          resolve(comment);
        }
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        resolve(null);
      }, { once: true });

      commentModalInstance.show();
    });

    if (!comment) {
      // Restore button state if user cancels
      button.disabled = false;
      button.innerHTML = originalContent;
      return;
    }

    // Get the current requests from localStorage
    const currentRequests = JSON.parse(localStorage.getItem("requests") || "[]");
    console.log("Current requests:", currentRequests);
    console.log("Looking for request with ID:", requestId);
    
    // Find the request by ID (handle both string and number IDs)
    const requestIndex = currentRequests.findIndex(r => {
      const storedId = r.id?.toString();
      const searchId = requestId.toString();
      console.log("Comparing IDs:", { storedId, searchId });
      return storedId === searchId;
    });
    
    console.log("Found request at index:", requestIndex);
    
    if (requestIndex === -1) {
      throw new Error("Request not found");
    }

    // Make API call to update status
    console.log("Making API call to update status:", {
      url: `${BASE_URL}/api/requests/${requestId}/status`,
      method: "PUT",
      body: {
        status: action,
        role: role,
        comment: comment
      }
    });

    const response = await fetch(`${BASE_URL}/api/requests/${requestId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        status: action,
        role: role,
        comment: comment
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update request status");
    }

    const responseData = await response.json();
    console.log("API Response:", responseData);

    // Update the request status locally
    currentRequests[requestIndex][`status_${role}`] = action;
    currentRequests[requestIndex][`comments_${role}`] = comment;
    
    // Save to localStorage
    localStorage.setItem("requests", JSON.stringify(currentRequests));

    // Update UI immediately
    const updatedRequest = currentRequests[requestIndex];
    const row = button.closest('tr');
    
    // Update status badges for all roles
    const statusCells = row.querySelectorAll('td:nth-child(7), td:nth-child(8), td:nth-child(9)');
    statusCells.forEach((cell, index) => {
      const roleKey = index === 0 ? 'hod' : index === 1 ? 'hr' : 'ithod';
      const status = updatedRequest[`status_${roleKey}`] || 'pending';
      const badge = cell.querySelector('.badge');
      if (badge) {
        badge.className = `badge ${getStatusBadgeClass(status)}`;
        badge.textContent = `${roleKey.toUpperCase()}: ${formatStatus(status)}`;
      }
    });

    // Update action buttons
    const actionCell = row.querySelector('td:last-child');
    if (actionCell) {
      const isITHODPending = updatedRequest.status_ithod === 'pending';
      const isHODApproved = updatedRequest.status_hod === 'approved';
      const isHRApproved = updatedRequest.status_hr === 'approved';
      const showITHODActions = isITHODPending && isHODApproved && isHRApproved;
      const disableITHODActions = isITHODPending && (!isHODApproved || !isHRApproved);

      if (role === 'ithod') {
        actionCell.innerHTML = `
          <span class="text-success">
            <i class="fas fa-check"></i>
            ${action === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        `;
      } else if (role === 'hod' || role === 'hr') {
        actionCell.innerHTML = `
          <span class="text-success">
            <i class="fas fa-check"></i>
            ${action === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        `;
      }
    }

    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${role.toUpperCase()} status updated to ${action} successfully!
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Reload requests after a short delay to ensure UI is updated
    setTimeout(() => {
      loadRequests();
    }, 1000);

  } catch (error) {
    console.error("Error updating request status:", error);
    
    // Show error message
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-danger border-0 position-fixed top-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${error.message || "Failed to update request status. Please try again."}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Restore button state on error
    button.disabled = false;
    button.innerHTML = originalContent;
  }
}

// Handle search functionality
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const filtered = requests.filter((r) => {
    // Search through all relevant fields
    return (
      (r.name && r.name.toLowerCase().includes(searchTerm)) ||
      (r.department && r.department.toLowerCase().includes(searchTerm)) ||
      (r.location && r.location.toLowerCase().includes(searchTerm)) ||
      (r.item && r.item.toLowerCase().includes(searchTerm)) ||
      (r.specialAllowance && r.specialAllowance.toLowerCase().includes(searchTerm)) ||
      (r.employeeCode && r.employeeCode.toLowerCase().includes(searchTerm)) ||
      (r.email && r.email.toLowerCase().includes(searchTerm)) ||
      (r.contactNumber && r.contactNumber.toLowerCase().includes(searchTerm)) ||
      (r.address && r.address.toLowerCase().includes(searchTerm)) ||
      (r.reason && r.reason.toLowerCase().includes(searchTerm)) ||
      (r.alternateContactNumber && r.alternateContactNumber.toLowerCase().includes(searchTerm))
    );
  });
  displayRequests(filtered);
}

// Handle filter buttons
function handleFilter(e) {
  const btn = e.target.closest(".btn");
  if (!btn || !btn.dataset.filter) return;

  document.querySelectorAll("[data-filter]").forEach((el) => {
    el.classList.remove("active");
  });
  btn.classList.add("active");

  const filter = btn.dataset.filter;
  const role = btn.dataset.role || "ithod";
  const requests = JSON.parse(localStorage.getItem("requests") || "[]");

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r[`status_${role}`] === filter);

  displayRequests(filteredRequests);
}

// Logout functionality
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "ithod_login.html";
}

// Initialize dashboard
function initDashboard() {
  if (!checkAuth()) return;
  console.log("Initializing dashboard...");
  loadRequests();

  // Remove any existing event listeners first
  const searchInput = document.getElementById("searchInput");
  const btnGroup = document.querySelector(".btn-group");
  const tableBody = document.getElementById("requestsTableBody");

  if (searchInput) {
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    newSearchInput.addEventListener("input", handleSearch);
  }

  if (btnGroup) {
    const newBtnGroup = btnGroup.cloneNode(true);
    btnGroup.parentNode.replaceChild(newBtnGroup, btnGroup);
    newBtnGroup.addEventListener("click", handleFilter);
  }

  if (tableBody) {
    const newTableBody = tableBody.cloneNode(true);
    tableBody.parentNode.replaceChild(newTableBody, tableBody);
    newTableBody.addEventListener("click", function (e) {
      const btn = e.target.closest(".action-btn");
      if (btn) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        handleAction(e);
      }
      
      const idLink = e.target.closest(".request-id-link");
      if (idLink) {
        e.preventDefault();
        showRequestDetails(idLink.dataset.id);
      }
    });
  }

  // Auto-refresh every 30 seconds
  const refreshInterval = setInterval(loadRequests, 30000);

  // Cleanup function for when the page is unloaded
  window.addEventListener('beforeunload', function() {
    clearInterval(refreshInterval);
    cleanupExistingModals();
  });
}

// Run initialization when page loads
document.addEventListener("DOMContentLoaded", initDashboard);
