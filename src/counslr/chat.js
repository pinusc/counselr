var sqlite3 = require('sqlite3').verbose();
var _ = require('underscore')()
var db = new sqlite3.Database(__dirname + '/resources/counselr.db');

var adjectives, animals;

sockets = []

module.exports = function (io) {
    var module = {};

    module.handleCommand = function (msg, socket) {
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

    module.saveMessage = function (room, socket, msg) {
        // var date = new Date().toISOString();
        var name = socket.name;
        
        db.run('INSERT INTO message (sender, message_text, chat_id) VALUES (?, ?, ?)', [socket.isCounselor, msg, socket.chat.id]);
        
        // db.run('INSERT INTO chat (date, name, msg) VALUES (?, ?, ?)', [date, name, msg]);
    }

    module.messageToJSON = function (sender_role, sender_name, message_text) {
        var messageJSON = {
            "sender_role" : sender_role,
            "sender_name" : sender_name,
            "message_text" : message_text
        };
        return messageJSON;
    }

    module.sendMessage = function (socket, message) {
        io.to(socket.id).emit('chat message', message);
    }

    module.onConnection = function (socket) {
        console.log('foo');
        sockets.push(socket);

        socket.on('chat message', function(msg){
            console.log(msg);
            if (msg[0] === "/") {
                module.handleCommand(msg, socket);
                return;
            }
            for (var room in socket.rooms) {
                if (room === socket.id) continue;
                // io.to(room).emit('chat message', socket.name + "$" + msg)
                var message = module.messageToJSON(socket.isCounselor, socket.name, msg);
                module.sendMessage(receiver_socket, message);
                module.saveMessage(room, socket, msg);
            }
        });

        socket.on('join', function(msg){
          for (var room in socket.rooms) { 
              if (room === socket.id) continue;
              socket.leave(room); // A socket may be only in one room at a time
          }
          socket.join(msg);
          console.log("join: " + msg);

          db.each('SELECT asker, counselor, chat_id FROM chat WHERE url IS (?)', msg.slice(1), function(err, row_chat){
              socket.chat = {
                  counselor_name: row_chat.counselor,
                  asker_name: row_chat.asker,
                  id: row_chat.chat_id
              }
              socket.name = row_chat.asker;
              db.each('SELECT sender, message_text FROM message WHERE chat_id IS (?)', row_chat.chat_id, function(err, row){

                  var sender_name = row.sender ? row_chat.counselor : row_chat.asker;
                  var message = module.messageToJSON(row.sender, sender_name, row.message_text);
                  console.log(message);
                  module.sendMessage(socket, message);
               });
          });

        });
        socket.on('role', function(msg){
            if (msg === 'adm') {
                socket.isCounselor = true;
                socket.name = socket.chat.counselor_name;
            }
        });
    }

    module.generatename = function () {
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

    module.loadNames = function () {
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

    var k = module.loadNames();
    module.adjectives = k[0], animals = k[1];
    io.on('connection', module.onConnection);
    return module;
};

