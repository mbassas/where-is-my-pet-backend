export enum ErrorType {
    INVALID_USERNAME_OR_PASSWORD,
    USERNAME_ALREADY_EXISTS,
    EMAIL_ALREADY_EXISTS,
    INVALID_USERNAME_OR_EMAIL,
    INVALID_TOKEN,
    ANIMAL_IMAGES_REQUIRED
}

const errorDetails = {
    [ErrorType.INVALID_USERNAME_OR_PASSWORD]: {
        status: 401,
        message: "Invalid credentials",
    },
    [ErrorType.USERNAME_ALREADY_EXISTS]: {
        status: 409,
        message: "Username already exists",
    },
    [ErrorType.EMAIL_ALREADY_EXISTS]: {
        status: 409,
        message: "Email already exists",
    },
    [ErrorType.INVALID_USERNAME_OR_EMAIL]: {
        status: 401,
        message: "Invalid Username or Email",
    },
    [ErrorType.INVALID_TOKEN]: {
        status: 401,
        message: "Invalid token",
    },
    [ErrorType.ANIMAL_IMAGES_REQUIRED]: {
        status: 400,
        message: "Images is required",
    },
}

class CustomError extends Error {
    public type: ErrorType;

    constructor(type: ErrorType, message?: string) {
        super(message);

        this.type = type;
    }

    public getHttpStatusCode(): number {
        const details = this._getErrorDetails();
        if (details) {
            return details.status;
        }

        return 500;
    }

    public getMessage(): string {
        if (this.message) {
            return this.message;
        }

        const details = this._getErrorDetails();
        if (details) {
            return details.message;
        }

        return "";
    }

    private _getErrorDetails() {
        if (errorDetails[this.type]) {
            return errorDetails[this.type];
        }
    }
}

export default CustomError;
