# Northcoders - Asrock News API

## Description

Building an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as Reddit) which should provide this information to the front end architecture.

## Getting Started

### Dependencies

- nodeJS        >v20.5.0
- node-pg       >v16.0.0
- expressJS     >v4.18.2
- dotenv        >v8.7.3
- jest          >27.5.1",
- jest-extended >2.0.0",
- jest-sorted   >1.0.14",
- pg-format     >1.0.4",
- supertest     >6.3.3"
- PostgreSQL    >v14.9 (local database)
- Insomnia      (or relevant, to consume APIs)

### Installing

#### Packages
```
$ npm install express
$ npm install pg
$ npm install dotenv --save
```
#### Testing suite packages
```
$ npm install --save-dev jest
$ npm install --save-dev jest-extended
$ npm install --save-dev jest-sorted
$ npm install supertest --save-dev
```

#### Database connection
In order to connect to the right database, you need to create two .env files for different enviroments databases.
Each files need to contain the name of the database to be used, in this case:

#### .env.development
``` 
PGDATABASE=<database_name>
```
#### .env.test
``` 
PGDATABASE=<database_name>
```
> NOTE: ```jest suite``` uses env.test and the selected database is wiped and re-seeded on each test.

#### .env.production - remote database
Using a remote database, like [ElephantSQL](https://www.elephantsql.com/)
``` 
DATABASE_URL=postgres://<remote_url>/<database_name>
```

#### Additional - psql user and password
When `.pgpass` file is not configured in your SO, you could add to those files:
```
PGUSER=<user>
PGPASSWORD=<password>
```

> NOTE: Be careful when setting password, ensure these files are added to `.gitignore`
### Create databases
Run from the terminal:
```
$ npm run setup-dbs
```

### Seed database
In test enviroment: database are seed programatically when using `jest suite`.

- Develoment enviroment
```
$ npm run seed
```

- Production enviroment
```
$ npm run seed-prod
```

### Executing program
#### Local
```
$ npm run start
```
#### Remote
Requires a remote host, like [Render](https://render.com/)

### Executing tests
```
npm run test
```

## Sample project

[API Backend](https://asrock-be-nc-news.onrender.com/api)

## Author

[Asrock](https://github.com/Asrock/asrock-be-nc-news)