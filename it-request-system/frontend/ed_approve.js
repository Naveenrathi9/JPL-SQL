// Parse query parameters from URL
function getQueryParams() {
  const params = {};
  window.location.search.substring(1).split("&").forEach(pair => {
    const [key, value] = pair.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(value || "");
  });
  return params;
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = getQueryParams();
  const requestId = params.id;
  const type = params.type;

  const form = document.getElementById("approveForm");
  const commentInput = document.getElementById("comment");
  const messageDiv = document.getElementById("message");

  // Check request status first
  try {
    const statusResponse = await fetch(`http://localhost:5000/api/request/${requestId}`);
    if (!statusResponse.ok) {
      throw new Error("Failed to fetch request status");
    }
    const requestData = await statusResponse.json();
    
    // Check if request is already actioned by ED
    if (requestData.status_ed !== "pending") {
      // Show already actioned message
      form.style.display = "none";
      messageDiv.innerHTML = `
        <div class="alert alert-warning">
          <h4>Request Already Processed</h4>
          <p>This request has already been ${requestData.status_ed} by Plant Head.</p>
          <p>Comment: ${requestData.comments_ed || "No comment provided"}</p>
        </div>
      `;
      return;
    }
  } catch (error) {
    messageDiv.innerHTML = `
      <div class="alert alert-danger">
        <h4>Error</h4>
        <p>${error.message}</p>
      </div>
    `;
    form.style.display = "none";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const comment = commentInput.value.trim();
    if (!comment) {
      messageDiv.textContent = "Approval comment is required.";
      messageDiv.style.color = "red";
      return;
    }

    // Show loading state on submit button
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch(`http://localhost:5000/api/approve?id=${requestId}&type=${type}&status=approved&comment=${encodeURIComponent(comment)}`, {
        method: "GET"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit approval");
      }

      const responseHtml = await response.text();
      document.body.innerHTML = responseHtml;

    } catch (error) {
      messageDiv.textContent = error.message;
      messageDiv.style.color = "red";

      // Restore submit button state on error
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}); 