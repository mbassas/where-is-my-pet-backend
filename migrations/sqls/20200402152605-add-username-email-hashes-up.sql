ALTER TABLE users 
ADD COLUMN  username_hash   varchar(64),
ADD COLUMN  email_hash      varchar(64);