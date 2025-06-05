const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Request = sequelize.define('Request', {
  name: DataTypes.STRING,
  employeeCode: DataTypes.STRING,
  designation: DataTypes.STRING,
  department: DataTypes.STRING,
  location: DataTypes.STRING,
  specialAllowance: DataTypes.STRING,
  item: DataTypes.STRING,
  reason: DataTypes.STRING,
  email: DataTypes.STRING,
  address: DataTypes.STRING,
  contactNumber: DataTypes.STRING,
  alternateContactNumber: DataTypes.STRING,

  requestedBy: {
    type: DataTypes.ENUM('self', 'behalf'),
    allowNull: false
  },
  hodEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: DataTypes.STRING,
  status_hod: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },

  status_ed: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },

  status_hr: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
 
  status_ithod: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },

  comments_hr: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  comments_hod: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  comments_ithod: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  comments_ed: {
    type: DataTypes.STRING,
    defaultValue: ''
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'requests',
  timestamps: false
});

module.exports = Request;
