const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  username: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Admin', 'Student', 'Instructor', 'Organization'),
    defaultValue: 'Student'
  },
  image_profile: {
    type: DataTypes.STRING(500),
    defaultValue: 'blank.png'
  },
  shortBio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  verification_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  verification_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  qualification: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  github: { type: DataTypes.STRING(500), allowNull: true },
  youtube: { type: DataTypes.STRING(500), allowNull: true },
  twitter: { type: DataTypes.STRING(500), allowNull: true },
  facebook: { type: DataTypes.STRING(500), allowNull: true },
  instagram: { type: DataTypes.STRING(500), allowNull: true },
  linkedin: { type: DataTypes.STRING(500), allowNull: true },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_superuser: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
