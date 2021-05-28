'use strict';

module.exports = app => {
  const { STRING, DATE, BOOLEAN, INTEGER, TEXT } = app.Sequelize;

  const PHistorys = app.model.define('phistorys', {
    pHistoryId: {
      type: INTEGER,
      primaryKey: true
    },
    pageId: INTEGER,
    userId: INTEGER,
    pName: STRING(20),
    createTime: DATE,
    pStyleData: TEXT('long'),
    pCompData: TEXT('long'),
    pDocName: STRING(100),
    saveType: INTEGER,
  }, {
    freezeTableName: true,
    timestamps: false,
  });

  return PHistorys;
};


/**
CREATE TABLE phistorys(
  p_history_id INT primary key auto_increment not null,
  page_id INT not null,
  user_id INT not null,
  p_name CHAR(20) not null,
  create_time datetime not null,
  p_style_data text not null,
  p_comp_data text not null,
  p_doc_name char(100) not null
)
 */