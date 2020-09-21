import Config from "./config";

const swaggerConfig = {
  info: {
    version: '1.0.0',
    title: 'Where is my Pet Backend',
    description: "Where is my Pet API. Provides endpoints for the Web Application.",
    contact: {
      name: "Where is my Pet",
      email: Config.EMAIL_USER,
      url: "https://mbassas.github.io/where-is-my-pet-frontend"
    },
  },
  security: {
    BearerToken: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },
  filesPattern: './Controllers/*', // Glob pattern to find your jsdoc files
  swaggerUIPath: '/api-docs', // SwaggerUI will be render in this url. Default: '/api-docs'
  baseDir: __dirname,
};

export default swaggerConfig;