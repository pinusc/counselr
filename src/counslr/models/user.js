var sqlite3 = require('sqlite3').verbose();
const path = require('path');
var dbPath = path.join(__dirname, "../", "resources/counselr.db");
var db = new sqlite3.Database(dbPath);


module.exports = function() {
    var module = {};

    module.findUser = function(email, callback) {
        console.log("findUser: " + email);
        console.log(email);
        db.get('SELECT user_id FROM user WHERE email IS (?)', email, function(err, row) {
            if (err) {
                callback(err.toString());
            }
            var user = row ? {id: row.user_id} : null;
            // user.id = row ? row.user_id : "";
            callback(null, user);
        });
    };

    module.addUser = function(email, callback) {
        db.run('INSERT INTO user (email) VALUES (?)', email, function(err) {
            if (err)
                callback(err.toString());
            callback(null, this.lastID);
        });
    };

    module.removeUser = function(email, callback) {
        db.run('DELETE FROM user WHERE email IS ?', email, function(err) {
            if (err)
                callback(err.toString());
            callback(null, this.lastID);
        });
    };
    return module;
}
