var express = require('express');
var app = express();
var sqlite3 = require('sqlite3').verbose();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore')()

var db = new sqlite3.Database(__dirname + '/resources/counselr.db');

var adjectives, animals;


app.get('/', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/', function(req, res){
    res.sendFile(__dirname + '/views/chat.html');
    // TODO implement validation
});

app.use(express.static(__dirname + '/static'));

sockets = []


function handleCommand(msg, socket) {
    var arr = msg.slice(1).split(" ");
    var cmd = arr[0], arg = arr.splice(1).join(" ");
    switch (cmd) {
        case "name":
            socket.name = arg.split(" ")[0];
            console.log(arg);
            break;
    }
    return; // Not yet implemented
}

function saveMessage(room, socket, msg) {
    // var date = new Date().toISOString();
    var name = socket.name;
    
    db.run('INSERT INTO message (sender, message_text, chat_id) VALUES (?, ?, ?)', [socket.isCounselor, msg, room.chat_id]);
    
    // db.run('INSERT INTO chat (date, name, msg) VALUES (?, ?, ?)', [date, name, msg]);
}

io.on('connection', function(socket){
    socket.isCounselor = Math.random() > 0.5;
    socket.name = generatename();
    sockets.push(socket);

    socket.on('chat message', function(msg){
        console.log(msg);
        if (msg[0] === "/") {
            handleCommand(msg, socket);
            return;
        }
        for (var room in socket.rooms) {
            if (room === socket.id) continue;
            io.to(room).emit('chat message', socket.name + "$" + msg)
            saveMessage(room, socket, msg);
        }
    });

    socket.on('join', function(msg){
      for (var room in socket.rooms) { 
          if (room === socket.id) continue;
          socket.leave(room); // A socket may be only in one room at a time
      }
      socket.join(msg);
    });
});

function generatename() {
    var first_adjective, second_adjective, animal;
    var rand; 
    first_adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    second_adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    animal = animals[Math.floor(Math.random() * adjectives.length)];
    
    first_adjective = first_adjective.charAt(0).toUpperCase() + first_adjective.slice(1);
    second_adjective = second_adjective.charAt(0).toUpperCase() + second_adjective.slice(1);
    animal = animal.charAt(0).toUpperCase() + animal.slice(1);
    
    console.log(first_adjective + second_adjective + animal);
    return first_adjective + animal;
}

function loadNames() {
    var animals = [], adjectives = [];
    var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/resources/adjectives')
    });

    lineReader.on('line', function (line) {
      adjectives.push(line);
    });

    lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(__dirname + '/resources/animals')
    });

    lineReader.on('line', function (line) {
      animals.push(line);
    });
    return [adjectives, animals];
}

// db.close();
function main () { 

    http.listen(3000, function(){
      console.log('listening on *:3000');

      var k = loadNames();
      adjectives = k[0], animals = k[1];
    });
}

main();
