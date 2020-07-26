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
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            allowNull: true
        },
        google_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
        type: {
            type: Sequelize.STRING,
            allowNull: true
        },
        message_token: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        },


    }, {
        defaultScope : {
            attributes : {
                exclude : ["password"]
            }
        },
        underscored: true,
        underscoredAll: true,

    }
);

module.exports = model;
