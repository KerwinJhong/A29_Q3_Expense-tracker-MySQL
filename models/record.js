'use strict';
module.exports = (sequelize, DataTypes) => {
  const Record = sequelize.define('Record', {
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    merchant: DataTypes.STRING,
    caseDate: DataTypes.DATE,
    amount: DataTypes.INTEGER
  }, {});
  Record.associate = function(models) {
    Record.belongsTo(models.User)
  };
  return Record;
};