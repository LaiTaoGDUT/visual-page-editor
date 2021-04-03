'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Users = app.model.define('users', {
    userId: {
      type: INTEGER,
      primaryKey: true
    },
    uMail: STRING(64),
    uName: STRING(16),
    uPassword: STRING(32),
  }, {
    freezeTableName: true,
    timestamps: false,
  });
  return Users;
};


/**
CREATE TABLE users(
  user_id INT PRIMARY key auto_increment not null,
  u_mail CHAR(64) not null,
  u_name CHAR(16) not null,
  u_password CHAR(32) not null
)
 */