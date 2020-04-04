const isProduction = process.env.NODE_ENV === "production";

const Config = {
    PRODUCTION: isProduction,
    PORT: process.env.PORT || 3001,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || "jsonwebtokensupersecret",
    JWT_RESET_PASSWORD_SECRET: process.env.JWT_SECOND_SECRET || "jsonwebtokensecret",
    ALLOWED_ORIGINS: isProduction ? "https://mbassas.github.io" : "*",
    AES_PASSWORD: process.env.AES_PASSWORD || "password",
    AES_SALT: process.env.AES_SALT || "salt",
    HMAC_PASSWORD: process.env.HMAC_PASSWORD || "password",
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
}

export default Config;