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
        let db = mongoose.createConnection("mongodb://1234:1234@ds035177.mlab.com:35177/web322_a7");

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
            let newUser = new User(userData);
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
                if (users[0].password === userData.password) {
                    resolve();
                } else {
                    reject("Incorrect Password for user: " + userData.user);
                }
            } else {
                reject("Unable to find user: " + userData.user);
            }
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.user);
        });
    });
};
