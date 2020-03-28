import bcrypt from 'bcrypt';
import { runQuery } from '../db/database';
import insertUserQuery from '../db/queries/users/insert_user';
import { UserInput, User } from '../Entities/user';
import getUserByUsernameQuery from '../db/queries/users/get_user_by_username';
import CustomError, { ErrorType } from './customErrors';

class UserModel {

    public async CreateUser(user: UserInput): Promise<void> {
        // Validate data

        // Encrypt Passwd
        const encryptedPassword = await this.EncryptPassword(user.password)

        // Insert into BBDD
        await runQuery(
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
    }

    public async LogInUser(username: string, password: string) {

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

        return user;
    }

    private EncryptPassword(password: string) {
        return bcrypt.hash(password, 10);
    }
}

export default new UserModel();