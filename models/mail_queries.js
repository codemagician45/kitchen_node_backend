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
        mail: {
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull:false
        },
        subject: {
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull:false,
            unique: false
        },
        html:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        is_sent:{
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

