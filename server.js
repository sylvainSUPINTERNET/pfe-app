var express = require('express');
var app = express();
var http = require('http').Server(app);
const http_request = require('http');

var session = require('express-session');

var path = require('path');

var bodyParser = require('body-parser');


const request = require('request');


//SI on veut utiliser les node_modules tels que bootstrap
app.use('node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());


// TWIG CONFIGURATION
var twig = require('twig');

app.set('view engine', 'twig');
app.set("view options", {layout: false});

// This section is optional and used to configure twig.
app.set("twig options", {
    strict_variables: false
});


app.get('/', function (req, res, next) {
    res.send("home app");
});



//REGISTER

var security = require('./security/security');
//SECURITY token
//Creation d'une session pour stocker notre token et le vérifier sur chaque route
app.use(session({secret: 'mySecretSession'}));
var current_session;


//Verification de l'existance du token sur toutes les routes de l'api !
/*
app.use('/api/*', function (req, res, next) {
    if (!req.session.token) {
        res.redirect('/signUp');
    } else {
        next();
    }
});
*/


//Inscription
app.get('/signUp', function (req, res) {
    var pathCheckSignUp = '/signUp';


    res.render('registration/signUp', {
        message: "Inscription page",
        pathCheckSignUp: pathCheckSignUp
    });
});

app.post('/signUp', function (req, res, next) {

    var firstname = req.body.firstname;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;


    var pathCheckSignUp = '/signUp';


    //Check if login / pass / passconfirmed respect rule
    var checkSignUpMessage = security.verificationSignUp(firstname, password, confirmPassword);
    if (checkSignUpMessage != "") {
        res.render('registration/signUp', {
            error: "Your login dont respect the rules !",
            pathCheckSignUp: pathCheckSignUp
        });
    }

    security.checkUserExist(firstname, function (data) {
        console.log(data.length);
        if (data.length == 1) {
            res.send("Firstname is already exist !");
            next();
        } else {
            if (checkSignUpMessage == "") {//pas d'erreur sur les données envoyées
                if (security.generateToken(firstname, password)) //si le token a correctemet était crée
                    var newToken = security.generateToken(firstname, password);  //c'est un objet comprenant firstname, token_str, date de creation
                security.createUser(firstname, password);
            } else {
                console.log("Erreur credentials signup ! token dosnt generate correctly !");
            }


            //get current user's token
            current_session = req.session;
            current_session.token = newToken["token"];
            console.log(current_session);


            res.render('client/home', {
                message: newToken["token"],
            });

        }
    });

});

//Login
app.get('/signIn', function (req, res) {
    var pathCheckSignIn = '/signIn';

    res.render('registration/signIn', {
        message: "Login page",
        pathCheckSignIn: pathCheckSignIn
    });
});

app.post('/signIn', function (req, res) {

    var firstname = req.body.firstname;
    var password = req.body.password;


    security.loginUser(firstname, password, function (dataUserLogin) {  // function(data) c'est la callback qui va contenir la reponse de la query
        var queryResult = dataUserLogin;

        var pathCheckSignIn = '/signIn'; //twig redirection if 0 user find for the login try

        security.loginTokenManage(firstname, password, function (dataTokenLogin) {
            var queryResultToken = dataTokenLogin;

            if (queryResultToken.length == 1) {
                console.log(`Connected as ${queryResult[0].firstname} with token ${queryResultToken[0].token}`);
                current_session = req.session;
                current_session.token = queryResultToken[0].token;

                res.render('client/home', {});
            } else {
                res.render('registration/signIn', {
                    message: "Login page",
                    error: "Bad credentials",
                    pathCheckSignIn: pathCheckSignIn
                });
            }
        });

    });

});

//Logout
app.get('/signOut', function (req, res) {
    //Delete session and token + redirect to signIn page (signUp accessible + signIn);
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/signIn');
        }
    });

});














//REVOIR LES ROUTES cote server pour ajouter le token DANS l'url pour permettre de faire des calls DEPUIS ICI sinon ca va renvoyer le redirect

app.get('/test', function (req, res, next) {

    var options = {
        host: 'localhost',
        port: 8000,
        path: '/api/getUsers/'+current_session.token,
        json: true
    };
    console.log("TOKEN ACTUEL" + current_session.token);
    http_request.get(options, function (resp) {

        var body = "";

        resp.setEncoding('utf-8');
        resp.on('data', function (chunk) {
            //console.log("chunk => " + chunk);
            console.log("chunk => " + chunk);
            body += chunk.toString();
        });

        resp.on("end", function () {
            var data = JSON.parse(body);
            console.log(data.data);
        });

    }).on("error", function (e) {
        console.log("Got error: " + e.message);
    });

    res.render('test.twig', {
        message: "Hello World"
    });
});


http.listen(8080, function () {
    console.log('app on *:8080');
});
