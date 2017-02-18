var sqlite3 = require('sqlite3').verbose();
var _ = require('underscore')()
var db = new sqlite3.Database(__dirname + '/resources/counselr.db');

var adjectives, animals;

module.exports = function (io) {
    var module = {};

    var chats = {};

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

    module.saveMessage = function (socket, msg) {
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
        var id = socket.id;
        if (socket instanceof String) id = socket;
        io.to(id).emit('chat message', message);
        // console.log("sendMessage: " + message + ", id: " + id, ", socket: " + socket);
        console.log("sendMessage");
    }

    function joinChat(socket, chat_name) {
        var chat = chats[chat_name] || [];
        chat.push(socket);
        chats[chat_name] = chat;
    }

    module.onConnection = function (socket) {
        socket.on('chat message', function(msg){
            console.log('msg received');
            if (msg[0] === "/") {
                module.handleCommand(msg, socket);
                return;
            }
            module.saveMessage(socket, msg);
            for (var i = 0; i < socket.chat.sockets.length; i++) {
                var receiver_socket = socket.chat.sockets[i];
                var message = module.messageToJSON(socket.isCounselor, socket.name, msg);
                module.sendMessage(receiver_socket, message);
            }
        });

        socket.on('join', function(msg){
          console.log("join: " + msg);

          chat_name = msg.slice(1);
          joinChat(socket, chat_name);
          db.get('SELECT asker, counselor, chat_id FROM chat WHERE url IS (?)', chat_name, function(err, row_chat){
              socket.chat = {
                  counselor_name: row_chat.counselor,
                  asker_name: row_chat.asker,
                  id: row_chat.chat_id,
                  sockets: chats[chat_name]
              }
              socket.name = row_chat.asker;
              db.each('SELECT sender, message_text FROM message WHERE chat_id IS (?)', row_chat.chat_id, function(err, row){

                  var sender_name = row.sender ? row_chat.counselor : row_chat.asker;
                  var message = module.messageToJSON(row.sender, sender_name, row.message_text);
                  // console.log(message);
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

