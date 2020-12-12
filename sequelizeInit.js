const { Sequelize, Model, DataTypes } = require('sequelize');
const recursive = require("recursive-readdir-sync");
const path = require("path");
const sequelize = new Sequelize(
    "mutfak",
    "postgres",
    "11murat11",
    {
        query:{
            raw:true,
        },
        host: "localhost",
        port: 5432,
        logging: false,
        dialect: "postgres",
        pool: {
            max: 30,
            min: 0,
            idle: 100000
        }
    }
);


module.exports = sequelize;
// adding files in model folder
let files;

try {
    files = recursive(path.join(__dirname, "models"));
} catch (err) {
    if (err.errno === 34) {
        console.log("Path does not exist");
    } else {
        //something unrelated went wrong, rethrow
        throw err;
    }
}
const models = {};
for (const i in files) {
    const file = path.parse(files[i]);
    models[file.name] = require(files[i]);
}


sequelize.sync(function(err){});