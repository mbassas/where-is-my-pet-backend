import bcrypt from 'bcrypt';
import { runQuery } from '../db/database';
import insertUserQuery from '../db/queries/users/insert_user';
import { UserInput, User } from '../Entities/user';
import getUserByUsernameOrEmailQuery from '../db/queries/users/get_user_by_username_or_email';
import CustomError, { ErrorType } from './customErrors';
import JWT from 'jsonwebtoken';
import config from '../config';
import getUserByIdQuery from '../db/queries/users/get_user_by_id';
import crypto from 'crypto';
import Config from '../config';
import resetPasswordQuery from '../db/queries/users/reset_password';
import sendEmail from './emailModel';

class UserModel {
    private _fieldsToEncrypt: Array<keyof UserInput> = ["email", "name", "surname", "username", "phone"]

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
                    this._createHash(user.email),
                    encryptedUser.phone,
                    encryptedUser.username,
                    this._createHash(user.username),
                    encryptedPassword
                ]
            );

            return this._getToken(queryResult.rows[0], config.JWT_SECRET, "7d");
        } catch (e) {
            if (e.constraint === 'users_username_hash_key') {
                // If username is duplicated 
                throw new CustomError(ErrorType.USERNAME_ALREADY_EXISTS);
            }
            if (e.constraint === 'users_email_hash_key') {
                // If email is duplicated 
                throw new CustomError(ErrorType.EMAIL_ALREADY_EXISTS);
            }
            console.error(e);
            throw e;
        }
    }

    public async LogInUser(username: string, password: string): Promise<string> {

        const queryResult = await runQuery<User>(getUserByUsernameOrEmailQuery, [
            this._createHash(username),
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

        return this._getToken(user, config.JWT_SECRET, "7d");
    }

    public async SendResetPassword(usernameOrEmail: string): Promise<void> {

        const queryResult = await runQuery<User>(getUserByUsernameOrEmailQuery, [
            this._createHash(usernameOrEmail),
        ]);

        if (queryResult.rowCount !== 1) {
            console.error("User not found");
            throw new CustomError(ErrorType.INVALID_USERNAME_OR_EMAIL);
        }

        const user = this._decryptUser(queryResult.rows[0]);

        const resetPasswordToken = this._getToken(queryResult.rows[0], Config.JWT_RESET_PASSWORD_SECRET, "1h");
        const resetPasswordLink = `https://mbassas.github.io/where-is-my-pet-frontend/#/recover-password?h=${resetPasswordToken}`;

        await sendEmail({
            destinationEmail: user.email,
            subject: "Reset your password",
            body: `<p>Hi ${user.name} ${user.surname},</p> <p>click the link below to restart your password:</p> <p><a href="${resetPasswordLink}">Reset Link</a></p>`
        });
    }

    public async ResetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.GetUserFromToken(token, Config.JWT_RESET_PASSWORD_SECRET);
        if (!user) {
            console.error("User not found");
            throw new CustomError(ErrorType.INVALID_TOKEN);
        }
        const encryptedPassword = await this._encryptPassword(newPassword);
        await runQuery<User>(
            resetPasswordQuery,
            [
                user.id,
                encryptedPassword
            ]
        );
    }

    private _getToken(user: User, secret: string, expiration: string): string {
        return JWT.sign({ id: user.id }, secret, { expiresIn: expiration });
    }
    public async GetUserFromToken(token: string, secret: string): Promise<User> {
        const { id } = JWT.verify(token, secret) as { id: number };

        const queryResult = await runQuery<User>(getUserByIdQuery, [
            id
        ]);

        if (queryResult.rowCount !== 1) {
            return null;
        }

        return this._decryptUser(queryResult.rows[0])

    }

    //#region Crypto
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

    private _createHash(data: string) {
        const hmac = crypto.createHmac("sha256", Config.HMAC_PASSWORD);

        return hmac.update(data).digest("hex");
    }
    private _encryptData(data: string): string {
        const key = crypto.scryptSync(Config.AES_PASSWORD, Config.AES_SALT, 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted = encrypted + cipher.final("hex");
        return iv.toString('hex') + ':' + encrypted;
    }

    private _decryptData(data: string): string {
        const key = crypto.scryptSync(Config.AES_PASSWORD, Config.AES_SALT, 32);
        const iv = new Buffer(data.split(':')[0], 'hex');
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(data.split(':')[1], "hex", "utf8");
        decrypted = decrypted + decipher.final("utf8");
        return decrypted;
    }
    //#endregion
}

export default new UserModel();