# A Web-based IDE for C language

⚠---------------PROJECT IS UNDER CONSTRUCTION----------⚠

## Introduction
This project is aimed to become an easily accessible IDE environment for C language.
Built with expandability in mind, the project has the potential to support more languages over time.

This repository is the front-end source code of the project. Built with React and TypeScript, utilizing only lightweight
components. 

## How to run

### Requirements
- Node.js and npm installed
- Add Node and npm to system PATH variable

### Steps
- Clone or download .zip file from this repository
- Clone or download the backend form [here](https://github.com/LQF39466/web-ide-server)
- Open your cloned repository of the front-end, run:

```shell
npm install
```

- Check `.env` file under your folder, make sure `BUILD_PATH` matched the backend repository you cloned, so npm will
build the project to the correct folder. Then run:

```shell
npm run build
```

- Go to the backend folder, run:

```shell
npm install
```

- Start the server by running `comms.js`:

```shell
node comms.js
```
- Access the app by entering `localhost:3001` in your browser.