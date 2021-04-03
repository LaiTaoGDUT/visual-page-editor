'use strict';

module.exports = app => {
  const { INTEGER } = app.Sequelize;

  const PAuthority = app.model.define('pauthority', {
    pageId: {
      type: INTEGER,
      primaryKey: true
    },
    userId: {
      type: INTEGER,
      primaryKey: true
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  // PAuthority.associate = function() {
  //   app.model.PAuthority.belongsTo(app.model.Pages, {
  //     foreignKey: 'pageId',
  //     onDelete: 'RESTRICT',
  //     onUpdate: 'RESTRICT',
  //   });
  //   app.model.PAuthority.belongsTo(app.model.Users, {
  //     foreignKey: 'userId',
  //     onDelete: 'RESTRICT',
  //     onUpdate: 'RESTRICT',
  //   });
  // };

  return PAuthority;
};


/**
CREATE TABLE pAuthority(
  user_id INT not null,
  page_id INT not null,
  primary key (user_id, page_id),
  foreign key (user_id) references users(user_id) on delete cascade on update cascade,
  foreign key (page_id) references pages(page_id) on delete cascade on update cascade
)
 */