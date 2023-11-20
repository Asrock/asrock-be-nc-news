# Northcoders - Asrock News API

## Setup ##
> IMPORTANT: This project requires psql to be installed and configured.

### Database connection ###
In order to connect to the right database, you need to create two .env files for different enviroments databases.
Each files need to contain the name of the database to be used, in this case:

#### .env.development ####
``` 
PGDATABASE=nc_news
```
#### .env.test ####
``` 
PGDATABASE=nc_news_test
```
> NOTE: ```jest suite``` uses env.test and the selected database is wiped and re-seeded on each test.

#### Additional - psql user and password ####
When ```.pgpass``` file is not configured in your SO, you could add to those files:
```
PGUSER=user
PGPASSWORD=password
```

> NOTE: Be careful when setting password, ensure these files are added to .gitignore
### Create databases ###
Run from the terminal:
```
npm run setup-dbs
```

### Seed ###
Test enviroment database are seed programatically when using ```jest suite```.

To seed the develoment enviroment database:
```
npm run seed
```