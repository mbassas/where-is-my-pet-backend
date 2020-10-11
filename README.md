# Where is my pet backend

  - [Quickstart](#quickstart)
  - [Configuration](#configuration)
  - [Google Cloud](#google-cloud)
  - [Sending Emails](#sending-emails)

## Quickstart

This project needs the following requirements to run:

* NodeJS v12.16
* A PostgreSQL database

First, install all the dependencies:

```
cd where-is-my-pet-backend
npm install
```

Create a `.env` file, and add the `DATABASE_URL`.

```
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
```

Run the migrations to generate the SQL schema:

```sh
npm run migrate up
```

Start the API:

```sh
# Development
npm run dev

# Production
npm run build
npm start

```

If you want to enable image recognition and email sending, please check the rest of the configuration below.

## Configuration

Configuration is done with environment variables. You can use a `.env` file, and the application will load the configuration automatically.

You can see the default values in the [config](src/config.ts) file.

Most configuration have a default value that is good enough for development. In production, all these variables should be set.

The only variable that is required to run, even in development mode, is the `DATABASE_URL`.

| Acronym | Summary |
| ------- | ------- |
| DATABASE_URL | Connection string to the database. `postgres://<user>:<password>@<host>:<port>/<database>` |
| PORT | Which port the application will start |
| JWT_SECRET | Password to encrypt the authentication JWT. Should be a strong password. |
| JWT_RESET_PASSWORD_SECRET | Password to encrypt the reset password tokens. Should be a strong password. |
| AES_PASSWORD | Password to encrypt database values |
| AES_SALT | Salt added to encrypted values |
| HMAC_PASSWORD | Password used to generate database hashes |
| EMAIL_USER | Username for the email service provider |
| EMAIL_PASSWORD | Password for the email service provider |

## Google Cloud

Please refer to the [Google Cloud documentation](https://cloud.google.com/docs/authentication/production#cloud-console) to set up a service account. 

The application can work without google access, but image recognition will not work.

## Sending Emails

The application will try to send emails using a gmail account, configured with the `EMAIL_USER` and `EMAIL_PASSWORD` variables.

It is likely that gmail blocks the application from signing in. If that happens, you need to turn on the [less secure apps](https://myaccount.google.com/lesssecureapps) settings in google.