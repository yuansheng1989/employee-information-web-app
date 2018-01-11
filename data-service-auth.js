const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema ({
    "user": { 
        "type": String,
        "unique": true
    },
    "password": String,
});

let User;

module.exports.initialize = function () {
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection("mongodb://1234:1234@ds151207.mlab.com:51207/web322_project");

        db.on('error', (err)=>{
            reject(err);
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise(function(resolve, reject) {
        if (userData.password === userData.password2) {
            bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    reject("There was an error encrypting the password");
                }
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    let newUser = new User(userData);
                    newUser.password = hash;
                    newUser.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        } else {
                            resolve();
                        }
                    });
                });
            });
        } else {
            reject("Passwords do not match");
        }
    });
};

module.exports.checkUser = function(userData) {
    return new Promise(function(resolve, reject) {
        User.find({user: userData.user})
        .exec()
        .then((users) => {
            if (users) {
                bcrypt.compare(userData.password, users[0].password).then((res) => {
                    if (res === true) {
                        resolve();
                    } else {
                        reject("Incorrect Password for user: " + userData.user);
                    }
                });
            } else {
                reject("Unable to find user: " + userData.user);
            }
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.user);
        });
    });
};

module.exports.updatePassword = function(userData) {
    return new Promise(function(resolve, reject) {
        if (userData.password === userData.password2) {
            bcrypt.genSalt(10, function(err, salt) {
                if (err) {
                    reject("There was an error encrypting the password");
                }
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    User.update({user: userData.user},
                        {$set: {password: hash}},
                        {multi: false})
                        .exec()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject("There was an error updating the password for user: " + userData.user);
                        });
                });
            });
        } else {
            reject("Passwords do not match");
        }
    });
};