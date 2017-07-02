'use strict';


//Config MYSQL - connection db
var db = require('../db_config/config'); //recupère la classe Db() donnant access a tous les elemnt de config tel que connection etc


//Toutes les méthodes de query / insert / delete / update  concernant les utilisateur call sur les routes sur app.js
var User = function () {
}; //class User



// ##################### ----------------------- #####################
// #####################          API            #####################
// ##################### ----------------------- #####################

// GET
// User by Firstname
// /api/getUser/:firstname
User.prototype.getUserByFirstname = function (userToSearch, callback) {  //callback indique que l'on va mettre en parametre une fonction pour recupéré les donnée
    var connection = db.dbConnection(); //recupere la connection à la db créer dans config_db
    connection.query("SELECT * from user where user.firstname = '" + userToSearch + "'", function (err, rows, fields, next) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows); // results are coming here.
        return callback(rows);
    });
};


// GET
// All users
// /api/getUsers
User.prototype.getUsers = function (callback) {
    var connection = db.dbConnection();
    connection.query("SELECT * from user", function (err, rows, fields, next) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows);
        return callback(rows);
    });
};


module.exports = new User();

