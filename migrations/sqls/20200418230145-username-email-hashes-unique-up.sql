ALTER TABLE users 
ADD CONSTRAINT users_username_hash_key UNIQUE (username_hash),
ADD CONSTRAINT users_email_hash_key UNIQUE (email_hash);