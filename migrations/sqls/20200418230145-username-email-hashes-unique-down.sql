ALTER TABLE ONLY users 
DROP CONSTRAINT users_username_hash_key,
DROP CONSTRAINT users_email_hash_key;