'use strict';

module.exports = app => {
  const { STRING, DATE, BOOLEAN, INTEGER, TEXT } = app.Sequelize;

  const Pages = app.model.define('pages', {
    pageId: {
      type: INTEGER,
      primaryKey: true
    },
    userId: INTEGER,
    pName: STRING(20),
    createTime: DATE,
    updateTime: DATE,
    locked: BOOLEAN,
    pStyleData: TEXT,
    pCompData: TEXT,
    pDocName: STRING(100),
    pImageLink: TEXT,
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  // Pages.associate = function() {
  //   app.model.Pages.belongsTo(app.model.Users, {
  //     foreignKey: 'userId',
  //     onDelete: 'RESTRICT',
  //     onUpdate: 'RESTRICT',
  //   });

  return Pages;
};


/**
CREATE TABLE pages(
  page_id INT primary key auto_increment not null,
  user_id INT not null, 
  p_name CHAR(20) not null,
  create_time datetime not null,
  update_time datetime not null,
  locked bool not null,
  p_style_data text not null,
  p_comp_data text not null,
  p_doc_name char(100) not null,
  p_image_link text,
  foreign key (user_id) references users(user_id) on delete cascade on update cascade
)
 */