'use strict';

module.exports = app => {
  const { STRING, DATE, TEXT, INTEGER } = app.Sequelize;

  const Templates = app.model.define('templates', {
    templateId: {
      type: INTEGER,
      primaryKey: true
    },
    userId: INTEGER,
    tName: STRING(20),
    createTime: DATE,
    tStyleData: TEXT('long'),
    tCompData: TEXT('long'),
    tImageLink: TEXT,
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  // Templates.associate = function() {
  //   app.model.Templates.belongsTo(app.model.Users, {
  //     foreignKey: 'userId',
  //     onDelete: 'RESTRICT',
  //     onUpdate: 'RESTRICT',
  //   });
  // };

  return Templates;
};


/**
CREATE TABLE templates(
  template_id INT primary key auto_increment not null,
  user_id INT not null, 
  t_name CHAR(20) not null,
  create_time datetime not null,
  t_style_data text not null,
  t_comp_data text not null,
  t_image_link text not null,
  foreign key (user_id) references users(user_id) on delete cascade on update cascade
)
 */