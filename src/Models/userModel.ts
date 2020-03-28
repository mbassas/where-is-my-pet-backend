import bcrypt from 'bcrypt';
import { runQuery } from '../db/database';
import insertUserQuery from '../db/queries/users/insert_user';
import { UserInput, User } from '../Entities/user';
import getUserByUsernameQuery from '../db/queries/users/get_user_by_username';
import CustomError, { ErrorType } from './customErrors';
import JWT from 'jsonwebtoken';
import config from '../config';
import getUserByIdQuery from '../db/queries/users/get_user_by_id';

class UserModel {

    public async CreateUser(user: UserInput): Promise<string> {

        const encryptedPassword = await this.EncryptPassword(user.password)

        try {
            const queryResult = await runQuery<User>(
                insertUserQuery,
                [
                    user.name,
                    user.surname,
                    user.email,
                    user.phone,
                    user.username,
                    encryptedPassword
                ]
            );

            return this.GetToken(queryResult.rows[0]);
        } catch (e) {
            if (e.constraint === 'users_username_key') {
                // If username is duplicated 
                throw new CustomError(ErrorType.USERNAME_ALREADY_EXISTS);
            }
        }
    }

    public async LogInUser(username: string, password: string): Promise<string> {

        const queryResult = await runQuery<User>(getUserByUsernameQuery, [
            username
        ]);

        if (queryResult.rowCount !== 1) {
            console.error("User not found");
            throw new CustomError(ErrorType.INVALID_USERNAME_OR_PASSWORD);
        }

        const user = queryResult.rows[0];

        const encryptedPassword = await this.EncryptPassword(password);
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
        return queryResult.rows[0];
    }

    private EncryptPassword(password: string) {
        return bcrypt.hash(password, 10);
    }
}

export default new UserModel();