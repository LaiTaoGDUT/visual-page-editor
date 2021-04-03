'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Components = app.model.define('components', {
    compId: {
      type: INTEGER,
      primaryKey: true
    },
    cName: STRING(20),
    cType: STRING(20),
    cDesc: STRING(255),
    cImageLink: STRING(1024),
    cHtmlName: STRING(100),
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  return Components;
};


/**
CREATE TABLE components(
  comp_id INT primary key auto_increment not null,
  c_name char(20) not null,
  c_type char(20) not null,
  c_desc char(255),
  c_image_link varchar(1024),
  c_html_name char(100)
)
 */