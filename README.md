# Northcoders - Asrock News API

## Description

Building an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.

## Getting Started

### Dependencies

- nodeJS        >v20.5.0
- node-pg       >v16.0.0
- express     >v4.18.2
- dotenv        >v8.7.3
- jest          >27.5.1",
- jest-extended >2.0.0",
- jest-sorted   >1.0.14",
- pg     >1.0.4",
- supertest     >6.3.3"
- PostgreSQL    >v14.9 (local database)
- Insomnia      (or relevant, to consume APIs)

### Installing

#### Packages
Run this command in the terminal to obtain the required dependencies.
```
$ npm install
````

#### Database connection
In order to connect to the right database is required to create one .env files for each database enviroments.

- .env.test
- .env.development
- .env.production - remote database

``` 
PGDATABASE=<database_name>
```
> NOTE: Be careful when setting password, ensure these files are added to `.gitignore`
### Create databases
Run from the terminal:
```
$ npm run setup-dbs
```

### Seed database

- Develoment enviroment:
```
$ npm run seed
```

- Test enviroment: ```jest``` uses this database and is wiped and seeded before on each test.

### Executing server

Run this command in the terminal.

```
$ npm run start
```

### Executing tests

```
npm run test
```

## Sample project

[API Backend](https://asrock-be-nc-news.onrender.com/api)

## Author

[Asrock](https://github.com/Asrock/asrock-be-nc-news)