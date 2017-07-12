'use strict';
var mysql = require('mysql');

//Definie your parameters to use DB - MYSQL
var Db = function () {
    this.login = "root";  //root
    this.password = "";   // ""
    this.localhost = "localhost";   //localhost
    this.database = "apipfe";     // your db (apipfe c'est la mienne)
}; //class Db


//Bind native MYSQL function for db connection / end connection
Db.prototype.loadConnection = function () {
    return this.dbConnection().connect();
};

Db.prototype.endConnection = function () {
    return this.dbConnection().end();

};

Db.prototype.getConfiguration = function () {
    var array_config = [];
    array_config.push(this.database, this.host, this.login, this.password);
    return array_config
};


//MYSQL create connection
Db.prototype.dbConnection = function () {
    var access_connection = "";
    access_connection = mysql.createConnection({
        host: this.host,
        user: this.login,
        password: this.password,
        database: this.database
    });

    return access_connection;
};


// TO DO
module.exports = new Db();
