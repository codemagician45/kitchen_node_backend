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
        type: {
            type : Sequelize.STRING,
            allowNull: true
        },
        name: {
            type : Sequelize.STRING,
            allowNull: true
        },
        files: {
            type : Sequelize.STRING,
            allowNull: true
        },
        street: {
            type : Sequelize.STRING,
            allowNull: true
        },
        house_number: {
            type : Sequelize.STRING,
            allowNull: true
        },
        postcode: {
            type : Sequelize.STRING,
            allowNull: true
        },
        city: {
            type : Sequelize.STRING,
            allowNull: true
        },
        land: {
            type : Sequelize.STRING,
            allowNull: true
        },
        telephone_number: {
            type : Sequelize.STRING,
            allowNull: true
        },
        status: {
            type : Sequelize.STRING,
            allowNull: false
        },
        attend_id: {
            type : Sequelize.INTEGER,
            allowNull: true
        },
        answer_one: {
            type : Sequelize.STRING,
            allowNull: true
        },
        answer_second: {
            type : Sequelize.STRING,
            allowNull: true
        },
        creation_time: {
            type : Sequelize.BIGINT,
            allowNull: true
        }

    },
    {
        underscored: true,
        underscoredAll: true
    }
);

module.exports = model;
