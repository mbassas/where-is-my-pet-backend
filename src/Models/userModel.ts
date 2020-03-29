import bcrypt from 'bcrypt';
import { runQuery } from '../db/database';
import insertUserQuery from '../db/queries/users/insert_user';
import { UserInput, User } from '../Entities/user';
import getUserByUsernameQuery from '../db/queries/users/get_user_by_username';
import CustomError, { ErrorType } from './customErrors';
import JWT from 'jsonwebtoken';
import config from '../config';
import getUserByIdQuery from '../db/queries/users/get_user_by_id';
import crypto from 'crypto';

class UserModel {

    public async CreateUser(user: UserInput): Promise<string> {

        const encryptedPassword = await this._encryptPassword(user.password)
        const encryptedUser = this._encryptUser(user);

        try {
            const queryResult = await runQuery<User>(
                insertUserQuery,
                [
                    encryptedUser.name,
                    encryptedUser.surname,
                    encryptedUser.email,
                    encryptedUser.phone,
                    encryptedUser.username,
                    encryptedPassword
                ]
            );

            return this.GetToken(queryResult.rows[0]);
        } catch (e) {
            if (e.constraint === 'users_username_key') {
                // If username is duplicated 
                throw new CustomError(ErrorType.USERNAME_ALREADY_EXISTS);
            }
            console.error(e);
            throw e;
        }
    }

    public async LogInUser(username: string, password: string): Promise<string> {

        const queryResult = await runQuery<User>(getUserByUsernameQuery, [
            this._encryptData(username)
        ]);

        if (queryResult.rowCount !== 1) {
            console.error("User not found");
            throw new CustomError(ErrorType.INVALID_USERNAME_OR_PASSWORD);
        }

        const user = queryResult.rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.error("Invalid password");
            throw new CustomError(ErrorType.INVALID_USERNAME_OR_PASSWORD);
        }

        return this.GetToken(user);
    }

    public GetToken(user: User): string {
        return JWT.sign(user.id.toString(), config.JWT_SECRET);
    }

    public async GetUserFromToken(token: string): Promise<User> {
        const userId = JWT.verify(token, config.JWT_SECRET);

        const queryResult = await runQuery<User>(getUserByIdQuery, [
            userId
        ]);

        if (queryResult.rowCount !== 1) {
            return null;
        }

        return this._decryptUser(queryResult.rows[0])

    }


    private _fieldsToEncrypt: Array<keyof UserInput> = ["email", "name", "surname", "username", "phone"]
    private _encryptUser(user: UserInput): UserInput {
        let encryptedUser = { ...user };
        this._fieldsToEncrypt.forEach((field) => {
            encryptedUser[field] = this._encryptData(user[field]);
        });

        return encryptedUser;
    }

    private _decryptUser(user: User): User {
        let decrypted = { ...user };
        this._fieldsToEncrypt.forEach((field) => {
            decrypted[field] = this._decryptData(user[field]);
        });

        return decrypted;
    }

    private _encryptPassword(password: string) {
        return bcrypt.hash(password, 10);
    }

    private _encryptData(data: string): string {
        const key = crypto.scryptSync("heythere", 'salt', 32);
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted = encrypted + cipher.final("hex");
        return encrypted;
    }

    private _decryptData(data: string): string {
        const key = crypto.scryptSync("heythere", 'salt', 32);
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(data, "hex", "utf8");
        decrypted = decrypted + decipher.final("utf8");
        return decrypted;
    }
}

export default new UserModel();