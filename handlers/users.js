
const model = require("../models/users");

exports.readAction = async (option) => {
    const users = model.findAll({
        ...option,
        raw : true
    });
    users.filter(user => {
        delete user.createdAt;
        delete user.updatedAt;
        return user;
    })
    return users ;
};