document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const messageDiv = document.getElementById("loginMessage");

  // Define allowed users as objects
  const allowedUsers = [
  { "username": "br.rao@jindalpower.com", "password": "Br@2025" },
  { "username": "gajendrarawat@jindalpower.com", "password": "Gajendra@2025" },
  { "username": "subirbiswas@jindalpower.com", "password": "Subir@2025" },
  { "username": "navneet.singh@jindalpower.com", "password": "Navneet@2025" },
  { "username": "rajarshi.gupta@jindalpower.com", "password": "Rajarshi@2025" },
  { "username": "subrata.adak@jindalpower.com", "password": "Subrata@2025" },
  { "username": "nandkishore.singh@jindalpower.com", "password": "Nandkishore@2025" },
  { "username": "arun.narayan@jindalpower.com", "password": "Arun@2025" },
  { "username": "gobardhan@jindalpower.com", "password": "Gobardhan@2025" },
  { "username": "birendra.singh@jindalpower.com", "password": "Birendra@2025" },
  { "username": "neerajchaubey@jindalpower.com", "password": "Neeraj@2025" },
  { "username": "sanjeev.parashari@jindalpower.com", "password": "Sanjeev@2025" },
  { "username": "sanjaykumar.singh@jindalpower.com", "password": "Sanjaykumar@2025" },
  { "username": "ajay.kanchhal@jindalpower.com", "password": "Ajay@2025" },
  { "username": "sandeep.sangwan@jindalpower.com", "password": "Sandeep@2025" },
  { "username": "sudeep@jindalpower.com", "password": "Sudeep@2025" },
  { "username": "ram.pandey@jindalpower.com", "password": "Ram@2025" },
  { "username": "saroj.pujari@jindalpower.com", "password": "Saroj@2025" },
  { "username": "ashish.kumar1@jindalpower.com", "password": "Ashish@2025" },
  { "username": "rishikesh.sharma@jindalpower.com", "password": "Rishikesh@2025" },
  { "username": "naveenrathi556@gmail.com", "password": "111" },
  { "username": "rudraprasad.misra@jindalpower.com", "password": "Rudraprasad@2025" },
  { "username": "shiv.singh@jindalpower.com", "password": "Shiv@2025" },
  { "username": "krishnendu.chattopadhyay@jindalpower.com", "password": "Krishnendu@2025" },
  { "username": "rkshrivastava@jindalpower.com", "password": "Rk@2025" },
  { "username": "om.prakash@jindalpower.com", "password": "Om@2025" },
  { "username": "sanjiv.kumar@jindalpower.com", "password": "Sanjiv@2025" },
  { "username": "vijay.jain@jindalpower.com", "password": "Vijay@2025" },
  { "username": "rajesh.dubey@jindalpower.com", "password": "Rajesh@2025" },
  { "username": "govind.kumar@jindalpower.com", "password": "Govind@2025" },
  { "username": "cso.jpl@jindalpower.com", "password": "Cso@2025" },
]
;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const submitButton = this.querySelector('button[type="submit"]');
    const buttonText = submitButton.innerHTML;

    // Show loading state
    submitButton.innerHTML = '<div class="spinner"></div>Logging in...';
    submitButton.classList.add("loading");
    submitButton.disabled = true;

    // Check credentials using the allowedUsers array
    const isValidUser = allowedUsers.some(
      user => user.username === username && user.password === password
    );

    if (isValidUser) {
      messageDiv.textContent = "Login successful! Redirecting...";
      messageDiv.className = "login-message success";

      // Store login state and username
      localStorage.setItem("isHodLoggedIn", "true");
      localStorage.setItem("loggedInUser", username);  // Store the username/email

      // Redirect to HR dashboard
      setTimeout(() => {
        window.location.href = "hod_dashboard.html";
      }, 1500);
    } else {
      messageDiv.textContent = "Invalid username or password";
      messageDiv.className = "login-message error";

      // Reset button state
      submitButton.innerHTML = buttonText;
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
    }
  });
});
