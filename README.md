
## Description

Quiz engine REST API built using NestJS (typescript). MongoDB used as a database with Prisma as an ORM.


## Features

```bash
- Users can register and sign in using their email and password. 
- JWT authorization
- Authenticated users can create a quiz
- 2 types of questions (single answer and multiple answers MCQs)
- Quizzes can be taken by other users once published
- Unpublished quizzes can be updated by the author,
- Authors can see users' reponses on their quizzes 
```


## Installation

```bash
$ npm install
```

## Running the app

```bash
# prisma migrations
$ npx prisma db push

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


