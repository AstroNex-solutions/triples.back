const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  jti: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

const AccountFreeze = sequelize.define('AccountFreeze', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  is_frozen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  freeze_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  freeze_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  freeze_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  freeze_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  frozen_by_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = { UserSession, AccountFreeze };
