npm create vite@latest my-react-app -- --template react# CRAFT
> The Collaborative Remote Asynchronous Feedback Tool provides a web-based, interactive, asynchronous online focus group for busy researchers in the educational, healthcare and military fields.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]

...

![](header.png)

## Devlopment Setup

OS X & Linux:

1. Download Node.js:
- Go to: https://nodejs.org/en/download
- Complete installation instructions via the Node.js installation wizard

2. Clone GitHub Repository
- Navigate to a local directory in your desired shell
```sh
git clone https://github.com/alexKotz-koz/CRAFT.git
```

3. Navigate inside the root directory of the project
- EX:
```sh
cd ~/Developer/CRAFT
```

4. Install server-side npm dependencies
```sh
npm i
```

5. Install client-side npm dependencies
```sh
cd client
npm i
```

6. Set up MongoDB development database
- Navigate to: https://account.mongodb.com/account/login
    - If you do not have a mongodb account, please create one or login to your existing account
- Navigate to Projects
- On the top right, click "New Project"
- Project Name: "CRAFT"
- Add Members and Set Permissions: Accept default options
- Once the project is created you should be directed to the Clusters page under the newly created project. Select "Build a Cluster"
- Select Free Cluster
- Accept default Configuration 
- !!! Do not "Preload sample dataset"
- Select "Create Cluster"
- Under "2. Create a database user", use default options. Make sure to copy your username and password for later. 
- Select "Create database user"
- Select "Choose a connection method"
- Select "Drivers" under "Connect to your application"
- Use default Node.js driver configuration (version 6.7 or later)
- mongodb npm package was already downloaded during the npm i in step 4 and 5
- Copy your connection string and save for later (ensure the "Show password" toggle is enabled so your password is present in your connection string)
- Select "Done"

7. Create a dev.js file to save your connection string
- Navigate back to the project directory in your IDE
- Under /config create a new file dev.js
- Copy and paste the following structure into your /config/dev.js file

```js
module.exports = {
    googleClientID: '',
    googleClientSecret: '',
    mongoURI: '<paste your mongodb connection string here>',
    cookieKey: 'year2030_CTEXT_00022020',
    redirectDomain: 'http://localhost:5173'
};
```
- Save dev.js

8. Run the project
- Navigate back to your shell at the root of the project and run the following command
```sh
npm run dev
```
- You should see the following logs in your shell:
```sh
> craft@0.1.3 dev
> concurrently "npm run server" "npm run client"
> craft@0.1.3 client
> npm run dev --prefix client
 

> craft@0.1.3 server
> nodemon index.js
 
[nodemon] 3.1.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`

> client@0.0.0 dev
> vite
 
VITE v6.0.6  ready in 280 ms
    ➜  Local:   http://localhost:5173/
    ➜  Network: use --host to expose
 Server is running on port 5001
```
- It is possible that the MongoDB cluster was not initialized yet (takes a few minutes). If you get an error in your shell please stop the server (Ctrl + C), wait a few minutes and try again.

- After a successful initialization of the backend and frontend servers, please navigate to http://localhost:5173 and start using the app!


## Development Specs:
- Node.js v20.15.1
- React.js v18.3.1

## Usage example

...

## Release History

* 0.1.3

## Meta


## Contributing

1. Fork it (<https://github.com/alexKotz-koz/CRAFT.git>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->
[npm-image]: https://img.shields.io/npm/v/datadog-metrics.svg?style=flat-square
[npm-url]: https://npmjs.org/package/datadog-metrics
[npm-downloads]: https://img.shields.io/npm/dm/datadog-metrics.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-datadog-metrics
[wiki]: https://github.com/yourname/yourproject/wiki
