# cs6400-2022-02-Team28

## Phase_3

### Developer Setup

#### Client

- Install `node` from the [official site](https://nodejs.org/en/download/) or with homebrew `brew install node@16`
  - Installing `node` will also install `npm`, its package manager
- Run React app
  - Navigate to `Phase_3/client`
  - Install client app dependencies with `cd Phase_3/client && npm install`
  - Execute `npm start`

#### Server

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
- Create a virtual environment for working with Python (It's a development environment isolated from the global environment)
  - `python3 -m venv Phase_3/server`
- Activate your virtual environment
  - `cd Phase_3/server && source bin/activate`
- Within the activated virtual environment install dependencies
  - `pip3 install -r requirements.txt`
- Run the app with `./start.sh` in the `Phase_3/server` directory

The frontend of this project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
