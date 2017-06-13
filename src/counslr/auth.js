var passwordless = require('passwordless');
var MemoryStore = require('passwordless-memorystore');
var email   = require("emailjs");
var session = require('express-session')
var FileStore = require('session-file-store')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var User = require('./models/user.js')();

module.exports = function(app, router) {
    var module = {}

    var smtpServer  = email.server.connect({
       user: "giuseppe.stelluto@gmail.com", 
       password: "quarantalbero meccanico 2", 
       host: "smtp.gmail.com", 
       port: 465,
       ssl: true
    });

    passwordless.init(new MemoryStore());

    passwordless.addDelivery(
        function(tokenToSend, uidToSend, recipient, callback) {
            var host = 'localhost:3000';
            smtpServer.send({
                text: 'Hello!\nAccess your account here: http://'
                + host + '?token=' + tokenToSend + '&amp;uid='
                + encodeURIComponent(uidToSend),
                from: "giuseppe.stelluto@gmail.com",
                to: recipient,
                subject: 'Token for counselr'
            }, function(err, message) {
                if(err) {
                    console.log(err);
                }
                callback(err);
            });
        });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    // app.use(require('morgan')('dev'));
    app.use(session({
        name: 'counslr-cookies',
        secret: 'crazy cookie counseling gremlin',
        saveUninitialized: true,
        resave: true,
        // store: new FileStore()
    }));

    app.use(passwordless.sessionSupport());
    app.use(passwordless.acceptToken({ successRedirect: '/admin' }));

    app.use(function(req, res, next) {
    if(req.user) {
        User.findById(req.user, function(error, user) {
            res.locals.user = user;
            next();
        });
    } else { 
        next();
    }
    });

    router.get('/login', function(req, res) {
        res.sendFile(__dirname + '/views/login.html');
    });

   /* POST: login details */
    router.post('/sendtoken',
        // function(req, res, next) {
        //     // TODO: Input validation
        //     console.log('stuck here');
        // },
        // Turn the email address into a user ID
        passwordless.requestToken(
            function(email_address, delivery, callback) {
                // console.log('stuck here');
                // console.log('user');
                // callback(null, user);
                callback(null, email_address);
                // User.findUser(email_address, function(error, user) {
                //     console.log("findUser");
                //     console.log(email_address);
                //     console.log(user);
                //     if(error) {
                //         callback(error.toString());
                //     } else if(user) {
                //         // return the user ID to Passwordless
                //         console.log("User: " + email);
                //         callback(null, user.email);
                //     } else {
                //         // If the user couldn’t be found: Create it!
                //         User.addUser(email_address,
                //             function(error, user) {
                //                 if(error) {
                //                     callback(error.toString());
                //                 } else {
                //                     callback(null, user.email);
                //                 }
                //         })
                //     }
                //    })
        }),
        function(req, res) {
            // Success! Tell your users that their token is on its way
            res.sendFile(__dirname + '/views/token_sent.html');
    });
    app.use('/', router);

    app.get('/admin', passwordless.restricted(),
        function(req, res) {
            res.send('admin: ' +  req.user);
    });
    router.get('/', function(req, res){
        // res.send('hi there')
        // res.sendFile(__dirname + '/views/index.html');
        // console.log(req);
        console.log("req.user: ", req.user);
        res.render('index.html', {foo: req.user ? req.user.email : ''});
    });

    return module 
}
