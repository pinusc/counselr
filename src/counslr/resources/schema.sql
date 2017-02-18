create table chat (
    chat_id INTEGER PRIMARY KEY, 
    asker INTEGER, 
    counselor INTEGER,
    url TEXT,
    FOREIGN KEY (asker) REFERENCES user(user_id)
    FOREIGN KEY (couselor) REFERENCES user(user_id)
);

create table message(
    message_id INTEGER PRIMARY KEY, 
    sender INTEGER, 
    message_text TEXT, 
    chat_id INTEGER, 
    FOREIGN KEY (chat_id) REFERENCES chat
);

create table user(
    user_id INTEGER PRIMARY KEY,
    email TEXT
);
