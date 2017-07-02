'use strict';


//Config MYSQL - connection db
var db = require('../db_config/config'); //recupère la classe Db() donnant access a tous les elemnt de config tel que connection etc

var sha256 = require('sha256');
var session = require('express-session');


//Toutes les méthodes de query / insert / delete / update  concernant les utilisateur call sur les routes sur app.js
var Security = function () {
}; //class security


// ##################### ----------------------- #####################
// #####################      REGISTRATION       #####################
// ##################### ----------------------- #####################

Security.prototype.verificationSignUp = function (firstname, password, confirmedPassword) {

    var firstnameToCheck = firstname.trim();
    var passwordToCheck = password.trim();
    var confirmedPasswordToCheck = confirmedPassword.trim();

    var messageError = "";

    if (firstnameToCheck.length > 1 && firstname != 'undefined' && typeof firstnameToCheck == "string") {
        //pas d'erreur;
        messageError = "";
    } else {
        messageError = "Erreur : firstname ! ";
        console.log("Erreur firstname must be more than 1 character !");
    }


    if (passwordToCheck.length > 3 && passwordToCheck != 'undefined' && typeof passwordToCheck == "string") {
        //pas d'erreur;
        messageError = "";

    } else {
        messageError = "Erreur : password ! ";
        console.log("Erreur password must be more than 3 characters");
    }


    if (passwordToCheck.length > 3 && passwordToCheck != 'undefined' && typeof passwordToCheck == "string" && confirmedPasswordToCheck == passwordToCheck) {
        //pas d'erreur;
        messageError = "";
    } else {
        messageError = "Erreur : confirmedPassword ! ";
        console.log("Erreur password confirmed must be more than 3 characters");

    }



    return messageError;
};


Security.prototype.generateToken = function (firstname, password) {

    var secretStr = "EyopgPUBSKKErn94CzYeyIcNfXCNumebkPRLvXk3lDCMjxH7MhQYohTx";
    var token_str = sha256(firstname, password, secretStr);



    var creation_time = new Date();

    var token = {"firstname": firstname, "token": token_str, "created": creation_time};

    return token;

};


//check if user already exist
Security.prototype.checkUserExist = function (firstname,callback) {
    var connection = db.dbConnection(); //recupere la connection à la db créer dans config_db
    connection.query("SELECT * FROM user WHERE user.firstname = '" + firstname + "'", function (err, rows, fields, next) {
        if (err) throw err;
        console.log('Data received from Db:\n');
        console.log(rows); // results are coming here.
        return callback(rows);
    });
};




Security.prototype.createUser = function (firstname, password) {

    var salt = "yopgPUBSKKErn94CzYNErn94fXCNumebkPErn943lDCMjxH";
    var hash_password = sha256(salt + password);
    var tokenBuild = Security.prototype.generateToken(firstname,password);


    //Verification si l'utilisateur existe déjà alors erreur


    var connection = db.dbConnection();

    connection.query("INSERT INTO tokens (token) VALUES ('" + tokenBuild.token + "' )", function (err, result) {
        if (err) throw err;
        console.log("User_Token => " + tokenBuild.token + " insert with succes ! ");
    });

    connection.query("INSERT INTO user (firstname, password) VALUES ('" + firstname + "', '" + hash_password + "' )", function (err, result) {
        if (err) throw err;
        console.log("User => " + firstname + " insert with succes ! ");
    });
};


Security.prototype.loginUser = function (firstname, password, callback) {  //callback indique que l'on va mettre en parametre une fonction pour recupéré les donnée
    var salt = "yopgPUBSKKErn94CzYNErn94fXCNumebkPErn943lDCMjxH";
    var hash_password = sha256(salt + password);

    var connection = db.dbConnection(); //recupere la connection à la db créer dans config_db

    connection.query("SELECT * FROM user WHERE user.firstname = '" + firstname + "' AND user.password = '" + hash_password + "'", function (err, rows, fields, next) {
        if (err) throw err;
        console.log('Data received from User table:\n');
        console.log(rows); // results are coming here.
        return callback(rows);
    });
};

Security.prototype.loginTokenManage = function (firstname, password, callback) {  //callback indique que l'on va mettre en parametre une fonction pour recupéré les donnée
    var salt = "yopgPUBSKKErn94CzYNErn94fXCNumebkPErn943lDCMjxH";
    var hash_password = sha256(salt + password);

    var tokenBuild = Security.prototype.generateToken(firstname,password);
    var connection = db.dbConnection(); //recupere la connection à la db créer dans config_db

    connection.query("SELECT * FROM tokens WHERE tokens.token = '" + tokenBuild.token + "'", function (err, rows, fields, next) {
        if (err) throw err;
        console.log('Data received from tokens table :\n');
        console.log(rows); // results are coming here.
        return callback(rows);
    });
};


module.exports = new Security();

