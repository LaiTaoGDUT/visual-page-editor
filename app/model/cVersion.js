'use strict';

module.exports = app => {
  const { STRING, DATE, TEXT, INTEGER, BOOLEAN } = app.Sequelize;

  const CVersion = app.model.define('cversion', {
    cVersionId: {
      type: INTEGER,
      primaryKey: true
    },
    compId: INTEGER,
    cVersionName: STRING(16),
    createTime: DATE,
    cCodeLink: STRING(255),
    defaultData: TEXT('long'),
    defaultUse: BOOLEAN,
    cSchema: TEXT,
    defaultStyle: TEXT('long'),
    cStyleSchema: TEXT,
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  // CVersion.associate = function() {
  //   app.model.CVersion.belongsTo(app.model.Components, {
  //     foreignKey: 'compId',
  //     onDelete: 'RESTRICT',
  //     onUpdate: 'RESTRICT',
  //   });
  // };

  return CVersion;
};


/**
CREATE TABLE cVersion(
  c_version_id INT primary key auto_increment not null,
  comp_id INT not null,
  c_version_name CHAR(20) not null,
  create_time datetime not null,
  c_code_link char(255) not null,
  default_data text not null,
  default_use bool not null,
  c_schema text not null,
  default_style text not null,
  c_style_schema text not null,
  foreign key (comp_id) references components(comp_id) on delete cascade on update cascade
)
 */