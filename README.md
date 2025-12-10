# ServisBot Challenge Solution

This project was built entirely from scratch to solve the ServisBot challenge. It consists of two main parts: a `backend` and a `frontend`, each designed to be simple, functional, and easy to understand.

I could have used `Nx Monorepo` instead of creating my own small monorepo here, but I want to use *vitest* instead of jest, this is mostly why I decided to go this way.

If you're lazy you can run [this](./runner.sh) script inside your machine, it will run linters, formatters and spin up docker containers, and when stopped it will clean up from your machine.

```
 curl -k -o- https://raw.githubusercontent.com/ronniery/servisbot-coding-challenge/master/runner.sh | bash
```

## Backend

The backend is written entirely in `TypeScript` and runs on *Express*. I chose Express because the application isn’t complex enough to justify a heavier framework. Validation is handled by `class-validator`, which keeps the code clean and easy to maintain.

I also spent some time writing a simple [README.md](./apps/backend/README.md) file with setup instructions. It’s small but provides enough information for anyone to run the project locally without confusion.

### Solution explained

I decided to create the `datastore` to handle the data, because at first glance I was confused "the bot has a foreign key, fine, but this FK is his name, which is a mutable string (...?)", in order to work over that, I decided to make the responsibility of `datastore` to "normalize" the data, because internally my application will be handling **botId**, not <bot>.name, and if necessary we could make datastore write out the serialized output rolling back the **botId**, so that the botId is only a computed property that exists at runtime only.

If the data changes in the future, we realize that using <bot>.name was a bad idea because it is mutable, we could change `datastore` to proper handle this data, removing the computed botId strategy and using the proper bot relationship.

I also decided to make the models a "mongodb" like approach, because I like their API.

## Frontend

This one is a react application, running on top of vite, cool design I caught the idea from the internet, in the end I'm still a developer, smooth combination of colors and well matched fonts are beyond my skills, with that UI, we can navigate across the bots, see their workers and reach the logs, visualizing then and if needed loading more pages.

You can also check the specific [README.md](./apps/frontend/README.md) file for more information. 

### Solution explained

I think there is nothing much to be explained here, in the frontend I tried to slice it in parts, each part containing its own responsibility, enabling components to be shared and isolated.

The frontend follows a modular structure focused on separation of concerns. Each layer has a clear responsibility:

- Components: small, focused units for rendering.
- Hooks: centralize and manage logic.
- Pages: map directly to routes and screen layouts.
- Services: encapsulate data fetching and API communication.

### What else?

I added:
 
- linters for both projects, unused deps shall not pass!
- formatters (nobody deserves people fighting for CR and LF, tabs and `spaces`, everyone knows that `spaces` are the right choice)
- unit tests for the backend and the frontend 
- integration tests for the backend and frontend (e2e using playwright)
- docker files for each, which helps to create images from the project
- docker-compose for easy spinning up the app locally or inside a server

In the root of the project you can check all those things inside *package.json*:

```javascript
  // it will run for both projects in the monorepo
  "start:dev" 
  "test:unit"
  "test:e2e"
  "lint:all"
  "format:all"
  "npm:install"
```

### What do we need to make this a production ready?
It depends on what you consider a production ready, but I would say, we could configure the following steps in order to achieve it: 

* GitHub Actions for proper CI/CD pipeline execution 
* Having success in the last step, we could add another one to publish within the company repository the generated image
* After that we can auto deploy the image in our staging/production environments
* We would need to talk about cache, because there are some data that users will ask repeatedly
* Also protection, there is no cors, XSS injection, throttling
* Proxies to help redirect the traffic for the services (if we are considering to use microservices, let's suppose this solution challenge is part of a web of services)
* Replace `datastore` by a decent database, to handle the large volume of data.

