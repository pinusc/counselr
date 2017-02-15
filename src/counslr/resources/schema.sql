create table chat (
    id INTEGER PRIMARY KEY, 
    asker TEXT, 
    counselor TEXT
);

create table message(
    message_id INTEGER, 
    sender INTEGER, 
    message_text TEXT, 
    chat_id INTEGER, 
    FOREIGN KEY (chat_id) REFERENCES chat
);
