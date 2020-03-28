const Config = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || "jsonwebtokensupersecret",
}

export default Config;