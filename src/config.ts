const isProduction = process.env.NODE_ENV === "production";

const Config = {
    PRODUCTION: isProduction,
    PORT: process.env.PORT || 3000,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || "jsonwebtokensupersecret",
    ALLOWED_ORIGINS: isProduction ? "https://mbassas.github.io/where-is-my-pet-frontend/" : "*",
    AES_PASSWORD: process.env.AES_PASSWORD || "password",
    AES_SALT: process.env.AES_SALT || "salt",
    HMAC_PASSWORD: process.env.HMAC_PASSWORD || "password"

}

export default Config;