const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../sequelizeInit");

const model = sequelize.define(
    path.parse(__filename).name,
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userid: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        path: {
            type: Sequelize.STRING,
            allowNull: false
        },

    },
    {
        underscored: true,
        underscoredAll: true
    }
);

module.exports = model;
