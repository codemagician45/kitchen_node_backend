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
        company_id: {
            type: Sequelize.INTEGER,
            defaultValue:null,
            allowNull:false
        },
        website:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        services:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        about_company:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        opening_hours:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        reviews:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        }
    }, {
        underscored: true,
        underscoredAll: true,

    }
);

module.exports = model;

