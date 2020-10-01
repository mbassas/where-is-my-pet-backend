import bcrypt from 'bcrypt';
import { runQuery } from '../db/database';
import insertUserQuery from '../db/queries/users/insert_user';
import updateUserQuery from '../db/queries/users/update_user';
import { UserInput, User } from '../Entities/user';
import CustomError, { ErrorType } from './customErrors';
import JWT from 'jsonwebtoken';
import config from '../config';
import crypto from 'crypto';
import Config from '../config';
import resetPasswordQuery from '../db/queries/users/reset_password';
import sendEmail from './emailModel';
import fs from "fs";
import path from "path";

const getUserByIdQuery = fs.readFileSync(path.resolve(__dirname, '../db/queries/users/get_user_by_id.sql'), "utf8");
const getUserByUsernameOrEmailQuery = fs.readFileSync(path.resolve(__dirname, '../db/queries/users/get_user_by_username_or_email.sql'), "utf8");
const getUserRolesQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/users/get_user_roles.sql"), "utf8");
const getUserByStatusQuery = fs.readFileSync(path.resolve(__dirname, "../db/queries/users/get_user_by_status.sql"), "utf8");

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
            body: `<p>Hi ${user.name} ${user.surname},</p> <p>click the link below to restart your password:</p> <p><a href="${resetPasswordLink}">Reset Link</a></p> <p>Where is my Pet team</p>`
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

        const user = await this.GetUserById(id);
        if (!user) {
            return null;
        }

        user.roles = await this._getRoles(user.id);

        return user;

    }

    private async _getRoles(userId: number): Promise<string[]> {
        const roles = await  runQuery<{role: string}>(getUserRolesQuery, [userId]);

        const defaultRoles = ["User"];

        if (roles.rowCount === 0) {
            return defaultRoles;
        }

        return [
            ...defaultRoles,
            ...roles.rows.map(v => v.role),
        ]
    }

    public async GetUsersByStatus(status: string[]): Promise<Partial<User>[]> {
        const users = await runQuery<User>(getUserByStatusQuery, [status]);

        if (users.rowCount === 0) {
            return [];
        }
    
        return users.rows
            .map( i => this._decryptUser(i))
            .map(u => ({
                id: u.id,
                username: u.username,
                status: u.status
            }));
    }

    public async UpdateUser(userId: number, params: Partial<User>) {
        try {
            const user = await this.GetUserById(userId);

            if (!user) {
                throw new CustomError(ErrorType.NOT_FOUND);
            }

            const updatedUser = {
                ...user,
                ...params,
            };

            if (user.status !== "Banned" && updatedUser.status === "Banned") {
                await sendEmail({
                    destinationEmail: updatedUser.email,
                    subject: "Your account has been suspended",
                    body: `<p>Hi ${updatedUser.name} ${updatedUser.surname},<p>After reviewing your content, we decided to block your account. You will not be able to upload more content, but you can still access and view the website. We are truly sorry to take this action, we hope you can understand the reasons.</p> <p>Best wishes, <br/>Where is my Pet team</p>`
                });
            }

            await runQuery<User>(updateUserQuery,
            [
                updatedUser.id,
                updatedUser.status
            ]
        ); 
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    public async GetUserById(userId: number): Promise<User | null> {
        try {
            const user = await runQuery<User>(getUserByIdQuery, [
                userId
            ]);

            if (user.rowCount !== 1) {
                return null;
            }

            return this._decryptUser(user.rows[0]);
        } catch(e) {
            console.error(e);
            return null;
        }
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