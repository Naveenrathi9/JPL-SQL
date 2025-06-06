const nodemailer = require("nodemailer");
require("dotenv").config({ path: "./backend/.env" });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateMailHTML = (requestData, requestId, approverType) => {
  const {
    name,
    employeeCode,
    designation,
    department,
    location,
    specialAllowance,
    item,
    reason,
    actionedViaEmail = {}
  } = requestData;

  // Access flat status fields like status_hod, status_hr, etc.
  const statusField = `status_${approverType.toLowerCase()}`;
  const statusValue = requestData[statusField] || 'pending';

  // Check if action has already been taken for this approver type
  const isActioned = actionedViaEmail?.[approverType.toLowerCase()] ||
    statusValue !== "pending";

  // Links for Plant Head (ED)
  const approveLink = `${process.env.CLIENT_URL}/ed_approve.html?id=${requestId}&type=ed`;
  const rejectLink = `${process.env.CLIENT_URL}/ed_reject.html?id=${requestId}&type=ed`;
  // Login links for other approvers
  const loginLink = `${process.env.CLIENT_URL}/${approverType.toLowerCase()}_login.html`;

  return `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333333; margin-bottom: 20px;">IT Asset Request - ${approverType=="ed"?"Plant Head":approverType.toUpperCase()} Approval Required</h2>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          An IT equipment request has been submitted by <strong>${name}</strong> (Employee Code: <strong>${employeeCode}</strong>), who is currently working as a <strong>${designation}</strong> in the <strong>${department}</strong> department for <strong>${location}</strong> location.
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          The requested item is <strong>${item}</strong>. The reason provided for this request is: <em>"${reason}"</em>.
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          <strong>Note:- Requires special permission for the request: ${specialAllowance}</strong>.
        </p>
        <p style="font-size: 15px; color: #444; line-height: 1.6; margin-top: 25px;">
          You are requested to review and verify before responding to this request using the options below:
        </p>
        <div style="margin: 25px 0;">
          ${isActioned 
            ? `<p style="color: #dc3545; font-weight: bold;">This request has already been ${statusValue} by ${approverType=="ed"?"Plant Head":approverType.toUpperCase()}.</p>`
            : approverType.toLowerCase() === 'ed' 
              ? `
                <a href="${approveLink}" style="display: inline-block; margin-right: 10px; padding: 12px 22px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px;">Approve</a>
                <a href="${rejectLink}" style="display: inline-block; padding: 12px 22px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 5px;">Reject</a>
              `
              : `
                <a href="${loginLink}" style="display: inline-block; padding: 12px 22px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Go to ${approverType.toUpperCase()} Login</a>
              `
          }
        </div>
      </div>
    </div>
  `;
};

const sendApprovalMail = async (requestData, approvalLevel) => {
  // Get the approval comment from the correct field
  const commentField = `comments_${approvalLevel.toLowerCase()}`;
  const approvalComment = requestData[commentField] || 'Not specified';

  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: requestData.email, // User's email
    subject: `✅ Request Approved by ${approvalLevel=="ed"?"Plant Head":approvalLevel.toUpperCase()}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">Request Approved</h2>
          <p style="font-size: 15px; color: #444; line-height: 1.6;">
            Your IT equipment request for <strong>${requestData.item}</strong> has been approved by the ${approvalLevel=="ed"?"Plant Head":approvalLevel.toUpperCase()}.
          </p>
          <p style="font-size: 15px; color: #444; line-height: 1.6;">
            <strong>Request Details:</strong><br>
            Employee: ${requestData.name} (${requestData.employeeCode})<br>
            Department: ${requestData.department}<br>
            Requested Item: ${requestData.item}<br>
            Reason: ${requestData.reason || 'Not specified'}<br>
            Comment: ${approvalComment}
          </p>
          <p style="font-size: 15px; color: #444; line-height: 1.6; margin-top: 25px;">
            Your request is moving forward in the approval process.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Notification for rejection
const sendRejectionMail = async (requestData, rejectionLevel) => {
  // Get the rejection comment from the correct field
  const commentField = `comments_${rejectionLevel.toLowerCase()}`;
  const rejectionComment = requestData[commentField] || 'Not specified';

  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: requestData.email, // User's email
    subject: `❌ Request Rejected by ${rejectionLevel=="ed"?"Plant Head":rejectionLevel.toUpperCase()}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #dc3545; margin-bottom: 20px;">Request Rejected</h2>
          <p style="font-size: 15px; color: #444; line-height: 1.6;">
            Your IT equipment request for <strong>${requestData.item}</strong> has been rejected by the ${rejectionLevel=="ed"?"Plant Head":rejectionLevel.toUpperCase()}.
          </p>
          <p style="font-size: 15px; color: #444; line-height: 1.6;">
            <strong>Request Details:</strong><br>
            Employee: ${requestData.name} (${requestData.employeeCode})<br>
            Department: ${requestData.department}<br>
            Requested Item: ${requestData.item}<br>
            Reason: ${requestData.reason || 'Not specified'}<br>
            Rejection Comment: ${rejectionComment}
          </p>
          <p style="font-size: 15px; color: #444; line-height: 1.6; margin-top: 25px;">
            Please contact your ${rejectionLevel.toUpperCase()} for more information.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Notification for final approval (when all levels have approved)
const sendFinalApprovalMail = async (requestData) => {
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: requestData.email, // User's email
    subject: `🎉 Request Fully Approved!`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">Request Fully Approved!</h2>
          <p style="font-size: 15px; color: #444; line-height: 1.6;">
            Congratulations! Your IT equipment request for <strong>${requestData.item}</strong> has been fully approved by all required approvers.
          </p>
          <p style="font-size: 15px; color: #444; line-height: 1.6;">
            <strong>Request Details:</strong><br>
            Employee: ${requestData.name} (${requestData.employeeCode})<br>
            Department: ${requestData.department}<br>
            Requested Item: ${requestData.item}<br>
            Reason: ${requestData.reason || 'Not specified'}<br>
            Comment: ${requestData.comments ? Object.values(requestData.comments).join(', ') : 'Not specified'}
          </p>
          <p style="font-size: 15px; color: #444; line-height: 1.6; margin-top: 25px;">
            The IT team will now process your request and contact you regarding the next steps.
          </p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// Approval request emails to approvers
const sendHODMail = async (requestData, requestId) => {
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: requestData.hodEmail,
    subject: "[HOD Approval] IT Equipment Request – Approval Needed",
    html: generateMailHTML(requestData, requestId, "hod"),
  };
  await transporter.sendMail(mailOptions);
};

const sendHRMail = async (requestData, requestId) => {
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_HR,
    subject: "[HR Approval] IT Equipment Request – Approval Needed",
    html: generateMailHTML(requestData, requestId, "hr"),
  };
  await transporter.sendMail(mailOptions);
};

const sendITHODMail = async (requestData, requestId) => {
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ITHOD,
    subject: "[ITHOD Appsroval] IT Equipment Request – Approval Needed",
    html: generateMailHTML(requestData, requestId, "ithod"),
  };
  await transporter.sendMail(mailOptions);
};

const sendEDMail = async (requestData, requestId) => {
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ED,
    subject: "[Plant Head Approval] IT Equipment Request – Approval Needed",
    html: generateMailHTML(requestData, requestId, "ed"),
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetMail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset_password.html?token=${token}`;
  const mailOptions = {
    from: `"IT Request System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2>Password Reset Request</h2>
          <p style="font-size: 14px;">Hello,

          We received a request to reset the password associated with your account. If you made this request, you can reset your password by clicking the link below:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 22px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="font-size: 14px;">This link will take you to a secure page where you can create a new password. For your security, the link will expire in 2 minutes and can only be used once.<br><br>
          If you have any questions or need help, feel free to contact our support team.
        <br><br>
        <strong>Thank you,<br>
        JPL IT Team</p></strong>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendHODMail,
  sendEDMail,
  sendHRMail,
  sendITHODMail,
  sendApprovalMail,
  sendRejectionMail,
  sendFinalApprovalMail,
  sendPasswordResetMail
};
