export enum ErrorType {
    INVALID_USERNAME_OR_PASSWORD,
}

const errorDetails = {
    [ErrorType.INVALID_USERNAME_OR_PASSWORD]: {
        status: 401,
        message: "Invalid credentials",
    },
}

class CustomError extends Error {
    public type: ErrorType;

    constructor(type: ErrorType, message?: string) {
        super(message);

        this.type = type;
    }

    public getHttpStatusCode(): number {
        const details = this.getErrorDetails();
        if (details) {
            return details.status;
        }

        return 500;
    }

    public getMessage(): string {
        if (this.message) {
            return this.message;
        }

        const details = this.getErrorDetails();
        if (details) {
            return details.message;
        }

        return "";
    }

    private getErrorDetails() {
        if (errorDetails[this.type]) {
            return errorDetails[this.type];
        }
    }
}

export default CustomError;
