var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore')()
var sassMiddleware = require('node-sass-middleware');
var db = new sqlite3.Database(__dirname + '/resources/counselr.db');

var router = express.Router();

var chat = require('./chat.js')(io);
var auth = require('./auth.js')(app, router);

app.get('/', function(req, res){
    // res.send('hi there')
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/', function(req, res){
    retrieveChatPage(req, res);
    // TODO implement validation
});


app.get('/chat/', function(req, res){
    retrieveChatPage(req, res);
});


function retrieveChatPage(req, res) {
    res.sendFile(__dirname + '/views/chat.html');
}

app.use(
    sassMiddleware({
        src: __dirname + '/sass',
        dest: __dirname + '/static',
        debug: false,
  })
);

app.use(express.static(__dirname + '/static'));



// db.close();
function main () { 

    http.listen(3000, function(){
      console.log('listening on *:3000');

    });
}

main();
