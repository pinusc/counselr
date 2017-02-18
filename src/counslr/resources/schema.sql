create table chat (
    chat_id INTEGER PRIMARY KEY, 
    asker TEXT, 
    counselor TEXT,
    url TEXT
);

create table message(
    message_id INTEGER, 
    sender INTEGER, 
    message_text TEXT, 
    chat_id INTEGER, 
    FOREIGN KEY (chat_id) REFERENCES chat
);

create table user(
    user_id INTEGER PRIMARY KEY,
    email TEXT
);
