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

const sendFinalMailToIT = async (request) => {
  try {
    const {
      name,
      employeeCode,
      designation,
      department,
      item,
      reason,
      email,
      status_hod,
      status_hr,
      status_ithod,
      status_ed,
      comments_hod,
      comments_hr,
      comments_ithod
    } = request;

    // Determine if request was approved or rejected
    const isApproved = status_ithod === "approved";
    const finalStatus = isApproved ? "Approved" : "Rejected";
    const statusColor = isApproved ? "#28a745" : "#dc3545";

    // Mail to IT
    const mailOptions = {
      from: `"IT Request System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_IT,
      subject: `🔔 New ${isApproved ? 'Approved' : 'Rejected'} IT Request`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #f4f6f8; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
              ${isApproved ? '📋 Request Approved' : '❌ Request Rejected'}
            </h2>
            <p style="font-size: 16px; color: #444;">
              The request submitted by <strong>${name}</strong> has been
              <span style="color: ${statusColor}; font-weight: bold;">${finalStatus}</span>
              ${!isApproved ? 'during the approval process' : ''}.
            </p>

            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr style="background: #f0f0f0;">
                <th align="left" style="padding: 10px;">👤 Name</th>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr>
                <th align="left" style="padding: 10px;">🆔 Employee Code</th>
                <td style="padding: 10px;">${employeeCode}</td>
              </tr>
              <tr style="background: #f0f0f0;">
                <th align="left" style="padding: 10px;">💼 Designation</th>
                <td style="padding: 10px;">${designation}</td>
              </tr>
              <tr>
                <th align="left" style="padding: 10px;">🏢 Department</th>
                <td style="padding: 10px;">${department}</td>
              </tr>
              <tr style="background: #f0f0f0;">
                <th align="left" style="padding: 10px;">🖥️ Requested Item</th>
                <td style="padding: 10px;">${item}</td>
              </tr>
              <tr>
                <th align="left" style="padding: 10px;">📝 Reason</th>
                <td style="padding: 10px;">${reason || 'Not specified'}</td>
              </tr>
            </table>

            <div style="margin-top: 25px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
              <h3 style="margin-bottom: 15px; color: #333;">Approval Status</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <th align="left" style="padding: 8px;">HOD</th>
                  <td style="padding: 8px;">
                    <span style="color: ${status_hod === 'approved' ? '#28a745' : status_hod === 'rejected' ? '#dc3545' : '#ffc107'};">
                      ${status_hod?.toUpperCase() || 'PENDING'}
                    </span>
                    ${comments_hod ? `<br><small style="color: #666;">${comments_hod}</small>` : ''}
                  </td>
                </tr>
                ${item === 'Printer' ? `
                <tr>
                  <th align="left" style="padding: 8px;">Plant Head</th>
                  <td style="padding: 8px;">
                    <span style="color: ${status_ed === 'approved' ? '#28a745' : status_ed === 'rejected' ? '#dc3545' : '#ffc107'};">
                      ${status_ed?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <th align="left" style="padding: 8px;">HR</th>
                  <td style="padding: 8px;">
                    <span style="color: ${status_hr === 'approved' ? '#28a745' : status_hr === 'rejected' ? '#dc3545' : '#ffc107'};">
                      ${status_hr?.toUpperCase() || 'PENDING'}
                    </span>
                    ${comments_hr ? `<br><small style="color: #666;">${comments_hr}</small>` : ''}
                  </td>
                </tr>
                <tr>
                  <th align="left" style="padding: 8px;">ITHOD</th>
                  <td style="padding: 8px;">
                    <span style="color: ${status_ithod === 'approved' ? '#28a745' : status_ithod === 'rejected' ? '#dc3545' : '#ffc107'};">
                      ${status_ithod?.toUpperCase() || 'PENDING'}
                    </span>
                    ${comments_ithod ? `<br><small style="color: #666;">${comments_ithod}</small>` : ''}
                  </td>
                </tr>
              </table>
            </div>

            <p style="margin-top: 30px; font-size: 13px; color: #888;">— IT Request System</p>
          </div>
        </div>
      `,
    };

    // Mail to User
    const mailOptionsToUser = {
      from: `"IT Request System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🔔 Your IT Request has been ${isApproved ? 'Approved' : 'Rejected'}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background: #f4f6f8; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
              ${isApproved ? '📋 Request Approved' : '❌ Request Rejected'}
            </h2>
            <p style="font-size: 16px; color: #444;">
              The request submitted by <strong>${name}</strong> has been
              <span style="color: ${statusColor}; font-weight: bold;">${finalStatus}</span>
              ${!isApproved ? 'during the approval process' : ''}.
            </p>

            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr style="background: #f0f0f0;">
                <th align="left" style="padding: 10px;">👤 Name</th>
                <td style="padding: 10px;">${name}</td>
              </tr>
              <tr>
                <th align="left" style="padding: 10px;">🆔 Employee Code</th>
                <td style="padding: 10px;">${employeeCode}</td>
              </tr>
              <tr style="background: #f0f0f0;">
                <th align="left" style="padding: 10px;">💼 Designation</th>
                <td style="padding: 10px;">${designation}</td>
              </tr>
              <tr>
                <th align="left" style="padding: 10px;">🏢 Department</th>
                <td style="padding: 10px;">${department}</td>
              </tr>
              <tr style="background: #f0f0f0;">
                <th align="left" style="padding: 10px;">🖥️ Requested Item</th>
                <td style="padding: 10px;">${item}</td>
              </tr>
              <tr>
                <th align="left" style="padding: 10px;">📝 Reason</th>
                <td style="padding: 10px;">${reason || 'Not specified'}</td>
              </tr>
            </table>

            <p style="margin-top: 25px; font-size: 15px; color: #555;">
              ${isApproved ? 
                '👉 The IT department will contact you regarding the next steps.' : 
                '👉 Please contact your department head if you need clarification.'}
            </p>
            ${!isApproved ? `
            <div style="margin-top: 20px; padding: 15px; background: #fff8f8; border-left: 4px solid #f44336;">
              <p style="margin: 0; color: #d32f2f;">
                <strong>Note:</strong> If you believe this was rejected in error, please discuss with your ${status_hod === "rejected" ? "HOD" : status_hr === "rejected" ? "HR" : "IT Head"}.
              </p>
            </div>
            ` : ''}
            <p style="margin-top: 30px; font-size: 13px; color: #888;">— IT Request System</p>
          </div>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(mailOptionsToUser),
      transporter.sendMail(mailOptions),
    ]);
  } catch (error) {
    console.error("Error in sendFinalMailToIT:", error);
    throw error;
  }
};

module.exports = sendFinalMailToIT;