export enum ErrorType {
    INVALID_USERNAME_OR_PASSWORD,
    USERNAME_ALREADY_EXISTS,
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
