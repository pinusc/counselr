var db = new sqlite3.Database(__dirname + '/resources/counselr.db');

module.exports = function() {
    var module = {};

    module.findUser = function(email, callback) {
        db.get('SELECT user_id FROM user WHERE email IS (?)', email, function(err, row) {
            if (err) {
                callback(err.toString());
            }
            callback(null, row.user_id);
        });
    };

    module.addUser = function(email, callback) {
        db.run('INSERT INTO user (email) VALUES (?)', email, function(err) {
            if (err)
                callback(err.toString());
            callback(null, this.lastID);
        };
    };

    module.removeUser = function(email, callback) {
        db.run('DELETE FROM user WHERE email IS ?', email, function(err) {
            if (err)
                callback(err.toString());
            callback(null, this.lastID);
        };
    };
    return module;
}
