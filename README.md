# NestJS Blog API - Sosh Backend Assignment

A simple blog API along with authentication built with NestJS.

## Features

- Authentication
  - Sign up
  - Sign in
- Blog
  - Create a blog
  - Get all blogs
  - Update a blog
  - Delete a blog
- User
  - Get user info along with the blogs created by the user

For authentication, I have used JWT Token based authentication. The token is valid for 1 hour. After that, the user will have to sign in again.

---
### Note 

If you are using Postman, you can import the collection from the `postman` folder. The collection will contain all the routes along with the request body and headers. You just need to add the token in the headers.

---

# API Documentation

| Route            | Method | Description                                            | Headers                         |
| ---------------- | ------ | ------------------------------------------------------ | ------------------------------- |
| /api/auth/signup | POST   | Sign up                                                | `Nil`                           |
| /api/auth/signin | POST   | Sign in                                                | `Nil`                           |
| /api/blog        | POST   | Create a blog                                          | `Authorization: Bearer <token>` |
| /api/blog        | GET    | Get all blogs                                          | `Nil`                           |
| /api/blog/:id    | PUT    | Update a blog                                          | `Authorization: Bearer <token>` |
| /api/blog/:id    | DELETE | Delete a blog                                          | `Authorization: Bearer <token>` |
| /api/user        | GET    | Get user info along with the blogs created by the user | `Authorization: Bearer <token>` |

## Pre-requisites

- We are using MongoDB in a docker container. So, make sure you have docker installed on your machine.
- Make sure you have NodeJS installed on your machine.
- Docker Compose is need to run the DB Instance.

## Installation

1. Clone the repository

```bash
$ git clone https://github.com/thegeorgenikhil/sosh-backend-assignment.git
```

2. Install dependencies

```bash
$ npm install
```

3. Start the MongoDB instance using docker-compose.yml

```bash
$ npm run db:dev:restart
```

4. Start the application

```bash
$ npm run start:dev
```

The application will be running on `http://localhost:3000`

## Running the tests

I have decided to go with Integration Tests for this assignment. I have used pactum for writing the tests. You can find the tests in the `test` folder.

For running the tests, we are starting a new instance of MongoDB in a docker container. Each time the tests are run, the container is removed and recreated. We are also wiping the database before running the tests.

```bash
$ npm run test
```

## NOTE

If you want to wipe the database and start fresh, you can run the following command.

```bash
$ npm run db:dev:restart
```

This will remove the existing container and create a new one. The database will be wiped and you will have a fresh start.
