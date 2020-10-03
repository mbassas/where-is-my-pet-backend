import { Router, Request, Response } from "express";
import { UserInput, User } from "../Entities/user";
import userModel from "../Models/userModel";
import CustomError from "../Models/customErrors";
import Joi from "@hapi/joi";
import { createValidator } from "express-joi-validation";
import { ApiRequest } from "..";
import forceAdminMiddleware from "../middleware/forceAdminMiddleware";
import sendEmail from "../Models/emailModel";
import forceLoginMiddleware from "../middleware/forceLoginMiddleware";
import notificationModel from "../Models/notificationModel";
import checkBannedMiddleware from "../middleware/checkBannedMiddleware";

const validator = createValidator();

const userController = Router();

const signUpBodySchema = Joi.object({
    name: Joi.string().required(),
    surname: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required()
});

async function signUp(req: ApiRequest<UserInput>, res: Response) {
    try {
        const token = await userModel.CreateUser(req.body);

        res.json({ token });
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

const signInBodySchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});
async function signIn({ body }: ApiRequest<{ username: string, password: string }>, res: Response) {
    try {
        const jwt = await userModel.LogInUser(body.username, body.password);

        res.json({ token: jwt });
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

const sendResetPasswordEmailBodySchema = Joi.object({
    usernameOrEmail: Joi.string().required(),
});
async function sendResetPasswordEmail({ body }: ApiRequest<{ usernameOrEmail: string }>, res: Response) {
    try {
        await userModel.SendResetPassword(body.usernameOrEmail);

        res.sendStatus(200);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            console.error(e);
            res.sendStatus(500);
        }
    }
}

const resetPasswordBodySchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().required(),
});
async function resetPassword({ body }: ApiRequest<{ token: string, newPassword: string }>, res: Response) {
    try {
        await userModel.ResetPassword(body.token, body.newPassword);

        res.sendStatus(200);
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
}

function getUserInfo(req: ApiRequest, res: Response) {
    if(req.user) {
        res.send({
            username: req.user.username,
            name: req.user.name,
            surname: req.user.surname,
            id: req.user.id,
            status: req.user.status,
            roles: req.user.roles
        });
        return;
    }

    res.sendStatus(204);
}

const getUsersByStatusQuerySchema = Joi.object({
    status: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).required(),
});
async function getUsersByStatus ({query}: ApiRequest, res: Response) {
    try {
        let status = typeof query.status === "string" ? [query.status] : query.status;
        const users = await userModel.GetUsersByStatus(status);

        res.status(200).send(users);

    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }

}

const updateUserParamsSchema = Joi.object({
    id: Joi.number().integer().required(), 
});
const updateUserBodySchema = Joi.object({
    status: Joi.string().required()
});
async function updateUser (req: ApiRequest<Partial<User>>, res: Response) {
    try {
        await userModel.UpdateUser(parseInt(req.params.id), req.body); 
        res.sendStatus(200);
       
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

const contactUserParamsSchema = Joi.object({
    id: Joi.number().integer().required(), 
});
const contactUserBodySchema = Joi.object({
    message: Joi.string().required(),
    phone: Joi.boolean().required(),
    email: Joi.boolean().required()
});
async function contactUser (req: ApiRequest<{message: string, phone: boolean, email: boolean}>, res: Response) {
    try {
        const sender = req.user;
        const receiver = await userModel.GetUserById(parseInt(req.params.id));

        let body = `<p>Hi ${receiver.name} ${receiver.surname},</p><p>You received the following message from ${sender.name} ${sender.surname}:</p> <hr></hr> <p>${req.body.message}</p>`;

        if (req.body.phone || req.body.email) {
            body += `<b>Contact details</b><ul>`

            if (req.body.phone) {
                body += `<li>Phone Number: ${sender.phone}</li>`;
            }
            if (req.body.email) {
                body += `<li>Email: ${sender.email}</li>`;
            }
            body += "</ul>";
        }

        body+="<br/><p>Where is my Pet team</p>";

        await sendEmail({
            destinationEmail: receiver.email,
            subject: "You have a new message",
            body: body
        });
        
        const notification =
        {   user_id: receiver.id,
            message: "You have a new message. Please check your email.",
            link: "",
            read: false
        };

        notificationModel.InsertNotification(notification);

        res.sendStatus(200);
       
    } catch (e) {
        if (e instanceof CustomError) {
            res.status(e.getHttpStatusCode()).send(e.getMessage());
        } else {
            res.sendStatus(500);
        }
    }
};

/**
 * Type definitions for this Controller
 * 
 * @typedef {object} User
 * @property {string} name.required
 * @property {string} surname.required
 * @property {string} email.required
 * @property {string} phone.required
 * @property {string} username.required
 * @property {string} password.required
 */

 /** 
 * @typedef {object} SignUpParams
 * @property {string} name.required
 * @property {string} surname.required
 * @property {string} email.required
 * @property {string} phone.required
 * @property {string} username.required
 * @property {string} password.required
 */

/**
 * @typedef {undefined} Empty
 */

/** 
 * @typedef {object} SignUpResponse
 * @property {string} token.required
*/

/** 
 * @typedef {object} SignInParams
 * @property {string} username.required
 * @property {string} password.required
 */

/** 
 * @typedef {object} SignInResponse
 * @property {string} token
 */

/** 
 * @typedef {object} ResetPasswordEmailParams
 * @property {string} usernameOrEmail.required
*/

/** 
 * @typedef {object} ResetPasswordParams
 * @property {string} token.required - A reset token obtained in the reset password email
 * @property {string} newPassword.required - The new password
 */

 /**
  * @typedef {object} ContactParams
  * @property {boolean} phone.required
  * @property {boolean} email.required
  * @property {string} message.required
  */

/**
 * GET /users
 * @tags Users
 * @summary Returns currently logged in use info 
 * @return {User} 200 - Success
 * @return {Empty} 204 - User not logged in
 * @security BearerToken
 */
userController.get("/", getUserInfo);

/**
 * POST /users/sign-up
 * @summary Creates a new user
 * @tags Users
 * @param {SignUpParams} request.body.required - Sign Up info - application/json
 * @return {SignUpResponse} 200 - Success
 * @return {string} 409 - Email or username already in use.
 */
userController.post("/sign-up", validator.body(signUpBodySchema), signUp);

/**
 * POST /users/sign-in
 * @summary Gets an access token to identify a user
 * @tags Users
 * @param {SignInParams} request.body.required - Sign In info - application/json
 * @return {SignInResponse} 200 - Success
 * @return {string} 401 - Bad Credentials
 */
userController.post("/sign-in", validator.body(signInBodySchema), signIn);

/**
 * POST /users/reset-password-email
 * @summary Requests a reset password email
 * @tags Users
 * @param {ResetPasswordEmailParams} request.body.required 
 * @return {Empty} 200 - Success
 * @return {string} 401 - Username or Email not found
 */
userController.post("/reset-password-email", validator.body(sendResetPasswordEmailBodySchema), sendResetPasswordEmail);

/**
 * POST /users/reset-password
 * @summary Sets a new password to a user
 * @tags Users
 * @param {ResetPasswordParams} request.body.required
 * @return {Empty} 200 - Success
 * @return {string} 401 - Invalid token
 */
userController.post("/reset-password", validator.body(resetPasswordBodySchema), resetPassword);

/**
 * GET /users/by-status
 * @summary Returns users by status
 * @tags Users
 * @param {string} status.query
 * @return {array<User>} 200 - Success
 * @return {string} 403 - Forbidden
 * @return {string} 401 - Unauthorized
 * @security BearerToken
 */
userController.get("/by-status", forceAdminMiddleware, validator.query(getUsersByStatusQuerySchema), getUsersByStatus);

/**
 * PATCH /users/{id}
 * @summary Updates a user
 * @tags Users
 * @param {number} id.path
 * @return {Empty} 200 - Success
 * @return {string} 404 - Not found
 * @return {string} 403 - Forbidden
 * @return {string} 401 - Unauthorized
 * @security BearerToken
 */
userController.patch("/:id", forceAdminMiddleware, validator.params(updateUserParamsSchema), validator.body(updateUserBodySchema), updateUser);

/**
 * POST /users/{id}/contact
 * @summary Send email to a user
 * @tags Users
 * @param {number} id.path
 * @param {ContactParams} request.body.required
 * @return {Empty} 200 - Success
 * @return {string} 404 - Not found
 * @return {string} 401 - Unauthorized
 * @security BearerToken
 */
userController.post("/:id/contact", validator.params(contactUserParamsSchema), validator.body(contactUserBodySchema), forceLoginMiddleware, checkBannedMiddleware, contactUser);

export default userController;