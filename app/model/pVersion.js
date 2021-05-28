'use strict';

module.exports = app => {
  const { STRING, DATE, TEXT, INTEGER, BOOLEAN } = app.Sequelize;

  const PVersion = app.model.define('pversion', {
    pVersionId: {
      type: INTEGER,
      primaryKey: true
    },
    pageId: INTEGER,
    pVersionName: STRING(16),
    createTime: DATE,
    pStyleData: TEXT('long'),
    pCompData: TEXT('long'),
    publish: BOOLEAN,
    pDocName: STRING(100),
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  // PVersion.associate = function() {
  //   app.model.PVersion.belongsTo(app.model.Pages, {
  //     foreignKey: 'pageId',
  //     onDelete: 'RESTRICT',
  //     onUpdate: 'RESTRICT',
  //   });
  // };

  return PVersion;
};


/**
CREATE TABLE pVersion(
  p_version_id INT primary key auto_increment not null,
  page_id INT not null,
  p_version_name CHAR(16) not null,
  create_time datetime not null,
  p_style_data text not null,
  p_comp_data text not null,
  publish bool not null,
  p_doc_name char(100) not null,
  foreign key (page_id) references pages(page_id) on delete cascade on update cascade
)
 */