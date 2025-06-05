const Request = require("../models/Request");
const { 
  sendHODMail,
  sendEDMail, 
  sendHRMail, 
  sendITHODMail,
  sendRejectionMail,
  sendApprovalMail,
  sendFinalApprovalMail
} = require("../utils/sendMail");
const sendFinalMailToIT = require("../utils/sendFinalMail");

const submitRequest = async (req, res) => {
  try {
    console.log("📥 Incoming request data:", req.body);
    console.log("Full req.body:", JSON.stringify(req.body));

    const { hodEmail, ithodEmail, requestedBy, item, ...restData } = req.body;
    const username = req.user?.username || 'unknown_user';

    // Initialize status with conditional ED approval
    const status = {
      hod: 'pending',
      hr: 'pending',
      ithod: 'pending',
      it: 'pending',
      ed: item === 'Printer' ? 'pending' : 'approved' // ED approval only for Printer
    };

    const newRequest = await Request.create({ 
      ...restData, 
      hodEmail,
      ithodEmail,
      requestedBy,
      item,
      username,
      status
    });

    console.log("✅ Request saved to DB:", newRequest.id);
    console.log("Saved request object:", newRequest);
    console.log("Saved request item:", newRequest.item);

    await sendHODMail({ ...restData, hodEmail, item }, newRequest.id);
    console.log("📧 Email sent to HOD for approval");

    res.status(200).json({ message: "Request submitted" });
  } catch (err) {
    console.error("❌ Error in submitRequest:", err);
    res.status(500).json({ error: "Request submission failed" });
  }
};

const handleApproval = async (req, res) => {
  const { id, type, status, comment } = req.query;

  try {
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).send("Request not found");
    }

    // Check if action has already been taken
    if (request.actionedViaEmail?.[type] || request[`status_${type}`] !== "pending") {
      return res.status(400).send(`
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <div style="font-size: 50px; margin-bottom: 15px; color: #dc3545;">
              ⚠️
            </div>
            <h2 style="color: #dc3545; margin-bottom: 15px; font-size: 24px; font-weight: 600;">
              Action Already Taken
            </h2>
            <p style="font-size: 16px; color: #555;">
              This request has already been ${request[`status_${type}`]} by ${type.toUpperCase()}.
            </p>
            <p style="margin-top: 40px; font-size: 13px; color: #999;">
              No further action can be taken on this request.
            </p>
          </div>
        </div>
      `);
    }

    // Validate the approval sequence
    if (type === "hr" && (!request.status_hod || request.status_hod !== "approved")) {
      return res.status(400).send("HOD must approve before HR");
    }
    if (type === "ithod" && (!request.status_hr || request.status_hr !== "approved")) {
      return res.status(400).send("HR must approve before ITHOD");
    }
    if (type === "ed") {
      if (!request.status_hod || request.status_hod !== "approved") {
        return res.status(400).send("HOD must approve before ED");
      }
    }
    if (type === "hr" && request.item === "Printer" && (!request.status_ed || request.status_ed !== "approved")) {
      return res.status(400).send("ED must approve before HR for Printer requests");
    }

    // Update the request status, comment and mark as actioned via email
    const updateData = {
      [`status_${type}`]: status,
      [`comments_${type}`]: comment || ''
    };

    // Update the request
    await request.update(updateData);

    const updatedActionedViaEmail = request.actionedViaEmail || {};
    updatedActionedViaEmail[type] = true;
    await request.update({ actionedViaEmail: updatedActionedViaEmail });

    if (status === "approved") {
      // Notify the user about approval at this level
      await sendApprovalMail(request, type);
      
      // Determine next step or final approval
      switch(type) {
        case "hod":
          if (request.item === "Printer") {
            await sendEDMail(request, id);
          } else {
            await sendHRMail(request, id);
          }
          break;
        case "ed":
          await sendHRMail(request, id);
          break;
        case "hr":
          await sendITHODMail(request, id);
          break;
        case "ithod":
          // Check if all approvals are complete
          const allApproved = 
            request.status_hod === "approved" && 
            (request.item === "Printer" ? request.status_ed === "approved" : true) &&
            request.status_hr === "approved" && 
            request.status_ithod === "approved";
            
          if (allApproved) {
            await sendFinalApprovalMail(request);
            await sendFinalMailToIT(request, id);
          }
          break;
      }
    } 
    else if (status === "rejected") {
      // Send rejection notification to user
      await sendRejectionMail(request, type);
    }
    
    res.send(`
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; text-align: center; max-width: 500px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          <div style="font-size: 50px; margin-bottom: 15px;">
            ${status === "approved" ? "✅" : "❌"}
          </div>
          <h2 style="color: ${status === "approved" ? "#28a745" : "#dc3545"}; margin-bottom: 15px; font-size: 24px; font-weight: 600;">
            Request ${status === "approved" ? "Approved" : "Rejected"}
          </h2>
          <p style="font-size: 16px; color: #555;">
            <strong>${type=="ed"?"Plant Head":type.toUpperCase()}</strong> has 
            ${status === "approved" ? "approved" : "rejected"} the request.
          </p>
          ${comment ? `
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">Comment:</p>
            <p style="font-size: 15px; color: #333;">${comment}</p>
          </div>
          ` : ''}
          <div style="margin-top: 30px;">
            <p style="font-size: 14px; color: #777;">Request ID:</p>
            <p style="font-weight: 500; color: #333; font-size: 18px;">${id}</p>
          </div>
          <p style="margin-top: 40px; font-size: 13px; color: #999;">
            This action has been recorded successfully.<br/>
            Thank you for your response.
          </p>
        </div>
      </div>
    `);
  } catch (err) {
    console.error("Error in handleApproval:", err);
    res.status(500).send("Something went wrong");
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({ order: [['createdAt', 'DESC']] });
    // Ensure each request has a status field
    const requestsWithStatus = requests.map(req => {
      const reqPlain = req.get({ plain: true });
      if (!reqPlain.status) {
        reqPlain.status = {
          hod: 'pending',
          hr: 'pending',
          ithod: 'pending',
          it: 'pending',
          ed: reqPlain.item === 'Printer' ? 'pending' : 'approved'
        };
      }
      if (!reqPlain.comments) {
        reqPlain.comments = {};
      }
      if (!reqPlain.actionedViaEmail) {
        reqPlain.actionedViaEmail = {};
      }
      return reqPlain;
    });
    res.status(200).json(requestsWithStatus);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, role, comment } = req.body;

  try {
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    console.log("Full request object:", request);
    const requestObj = request.get({ plain: true });
    console.log(`updateRequestStatus called with id=${id}, role=${role}, status=${status}, item=${requestObj.item}`);

    // Validate the approval sequence
    if (role === "hr" && requestObj.status_hod !== "approved") {
      return res.status(400).json({ error: "HOD must approve before HR" });
    }
    if (role === "hr" && requestObj.item === "Printer" && requestObj.status_ed !== "approved") {
      return res.status(400).json({ error: "ED must approve before HR for Printer requests" });
    }
    if (role === "ithod" && requestObj.status_hr !== "approved") {
      return res.status(400).json({ error: "HR must approve before ITHOD" });
    }

    // Update the status and comment fields directly
    const updateData = {
      [`status_${role}`]: status,
      [`comments_${role}`]: comment
    };

    // Update the request
    await request.update(updateData);

    console.log("Updated request:", await request.reload());

    if (status === "approved") {
      // Notify the user about approval at this level
      await sendApprovalMail(request, role);
      
      // Determine next step or final approval
      switch(role) {
        case "hod":
          if (requestObj.item === "Printer") {
            await sendEDMail(request, id);
          } else {
            await sendHRMail(request, id);
          }
          break;
        case "ed":
          await sendHRMail(request, id);
          break;
        case "hr":
          await sendITHODMail(request, id);
          break;
        case "ithod":
          // Check if all approvals are complete
          const allApproved = 
            requestObj.status_hod === "approved" && 
            (requestObj.item === "Printer" ? requestObj.status_ed === "approved" : true) &&
            requestObj.status_hr === "approved" && 
            requestObj.status_ithod === "approved";
            
          if (allApproved) {
            await sendFinalApprovalMail(request);
            await sendFinalMailToIT(request, id);
          }
          break;
      }
    } 
    else if (status === "rejected") {
      // Send rejection notification to user
      await sendRejectionMail(request, role);
    }

    res.status(200).json({ 
      message: "Status updated successfully",
      request: await request.reload()
    });
  } catch (err) {
    console.error("Error in updateRequestStatus:", err);
    res.status(500).json({ error: "Failed to update request status" });
  }
};

const User = require('../models/User');

const getUserRequestHistory = async (req, res) => {
  try {
    const employeeCode = req.user.employeeCode;
    // console.log("User ID from token:", userId);
    // if (!userId) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }
    const requests = await Request.findAll({ where: { employeeCode } });
    res.status(200).json(requests);
  } catch (err) {
    console.error("❌ Error fetching user request history:", err);
    res.status(500).json({ error: "Failed to fetch user request history" });
  }
};

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    console.error("Error in getRequestById:", err);
    res.status(500).json({ error: "Failed to fetch request" });
  }
};

module.exports = { 
  submitRequest, 
  handleApproval, 
  getAllRequests,
  updateRequestStatus,
  getUserRequestHistory,
  getRequestById
};
