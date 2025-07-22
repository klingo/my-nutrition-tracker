# My Nutrition Tracker

[![CI/CD Pipeline](https://github.com/klingo/my-nutrition-tracker/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/klingo/my-nutrition-tracker/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/klingo/my-nutrition-tracker/graph/badge.svg?token=028Z6Z5XKY)](https://codecov.io/gh/klingo/my-nutrition-tracker)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

![My Nutrition Tracker Logo](/client/src/assets/logo/apple-touch-icon.png)

A simple nutrition tracking application to help users log and monitor their dietary intake.

## Environment Variables

### Server

| Variable               | Description                                 | Required | Default                |
|------------------------|---------------------------------------------|----------|------------------------|
| PORT                   | Port the express server will run on         | No       | 3001                   |
| NODE_ENV               | Environment (development/production)        | No       | production             |
| SSL_CERT_PATH          | Path to the SSL certificate file            | No       | null                   |
| SSL_KEY_PATH           | Path to the SSL key file                    | No       | null                   |
| CLIENT_URL             | URL of the client application (CORS origin) | No       | https://localhost:3000 |
| MONGO_URI              | URI to connect to MongoDB                   | Yes      | null                   |
| JWT_SECRET             | JWT secret key                              | Yes      | null                   |
| JWT_EXPIRES_IN         | JWT access token expiration time            | No       | 15m                    |
| JWT_REFRESH_EXPIRES_IN | JWT refresh token expiration time           | No       | 30d                    |
| COOKIE_ACCESS_MAX_AGE  | MaxAge of access token cookie (in ms)       | No       | 900000                 |
| COOKIE_REFRESH_MAX_AGE | MaxAge of refresh token cookie (in ms)      | No       | 2592000000             |
| PASSWORD_SALT_ROUNDS   | Number of salt rounds for password hashing  | No       | 10                     |
| PASSWORD_PEPPER        | Password pepper for password hashing        | No       | ''                     |

### Client

| Variable      | Description                          | Required | Default    |
|---------------|--------------------------------------|----------|------------|
| PORT          | Port the client will run on          | No       | 3000       |
| NODE_ENV      | Environment (development/production) | No       | production |
| SSL_CERT_PATH | Path to the SSL certificate file     | No       | null       |
| SSL_KEY_PATH  | Path to the SSL key file             | No       | null       |

## License

[MyNutritionTracker](https://github.com/klingo/my-nutrition-tracker) © 2025 by [Fabian Sch&auml;r](https://github.com/klingo) is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
