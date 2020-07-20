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
        users_id: {
            type: Sequelize.INTEGER,
            defaultValue:null,
            allowNull:false
        },
        salutation:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        name:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        surname:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        kvk_number:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        company_name:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        telephone_number:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        house_number:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        street:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        postcode:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        city:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        land:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
        photo:{
            type: Sequelize.STRING,
            defaultValue:null,
            allowNull: true
        },
    }, {
        underscored: true,
        underscoredAll: true,

    }
);

module.exports = model;

