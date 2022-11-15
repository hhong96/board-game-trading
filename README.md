## Developer Setup

### Client

- Install `node` from the [official site](https://nodejs.org/en/download/) or with homebrew `brew install node@16`
  - Installing `node` will also install `npm`, its package manager
- Run React app
  - Navigate to `Phase_3/client`
  - Install client app dependencies with `cd Phase_3/client && npm install`
  - Execute `npm start`

### Server

- Install `Postgres 14` from the [official site](https://www.postgresql.org/download/) or with homebrew `brew install postgres` or with docker using 

  ```bash
  docker run \
    -p 5432:5432 \
    -e POSTGRES_HOST_AUTH_METHOD=trust \
    -e POSTGRES_PASSWORD=password \
    -v "$PWD/Phase_3/server/pg/data":/var/lib/postgresql/data \
    -v "$PWD/Phase_3/server/pg/init":/docker-entrypoint-initdb.d \
    -d \
    postgres:14.4
  ```

  - If you install postgres without using docker, use psql to initialize the database with `psql -f Phase_3/sever/pg/init/schema.sql -d postgres`
  - To access your docker database you can use [psql](https://www.timescale.com/blog/how-to-install-psql-on-mac-ubuntu-debian-windows/) `psql -h localhost -p 5432 -U postgres`

- Install [python3](https://www.python.org/downloads/) if not already installed
- Create a virtual environment for working with Python 
  - `python3 -m venv Phase_3/server`
- Activate your virtual environment
  - `cd Phase_3/server && source bin/activate`
- Within the activated virtual environment install dependencies
  - `pip3 install -r requirements.txt`
- Run the app with `./start.sh` in the `Phase_3/server` directory

The frontend of this project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

