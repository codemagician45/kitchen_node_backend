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
        offer_id: {
            type: Sequelize.INTEGER,
            defaultValue:null,
            allowNull:false
        },
        user_id:{
            type: Sequelize.INTEGER,
            defaultValue:null,
            allowNull: true
        },
    }, {
        underscored: true,
        underscoredAll: true,

    }
);

module.exports = model;

