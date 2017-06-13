var sqlite3 = require('sqlite3').verbose();
const path = require('path');
var dbPath = path.join(__dirname, "../", "resources/counselr.db");
var db = new sqlite3.Database(dbPath);


module.exports = function() {
    var module = {};

    module.findUser = function(email, callback) {
        db.get('SELECT * FROM user WHERE email IS (?)', email, function(err, row) {
            if (err) {
                callback(err.toString());
            }
            // var user = row ? {id: row.user_id} : null;
            // user.id = row ? row.user_id : "";
            callback(null, row);
        });
    };

    module.findById = function(id, callback) {
        db.get('SELECT * FROM user WHERE user_id IS (?)', id, function(err, row) {
            if (err) {
                callback(err.toString());
            }
            // user.id = row ? row.user_id : "";
            callback(null, row);
        });
    }

    module.addUser = function(email, callback) {
        db.run('INSERT INTO user (email) VALUES (?)', email, function(err) {
            if (err)
                callback(err.toString());
            module.findById(this.lastID, function(err, row) {
                if (err) {
                    callback(err.toString());
                }
                callback(null, row);
            });
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
