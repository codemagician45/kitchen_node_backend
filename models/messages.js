const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../sequelizeInit");

const model = sequelize.define(
    path.parse(__filename).name,
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        room_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        sender: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        date: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        isRead: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        message: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false
        },
    }, {
        defaultScope : {
        },
        underscored: true,
        underscoredAll: true,

    }
);

module.exports = model;
