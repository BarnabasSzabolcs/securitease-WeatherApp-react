# securitease-WeatherApp-react
Weather app in react (Securitease Job interview)

## Objective:
Build a weather application that showcases your ability to create a production-ready front-end application with React.
The app should include the core functionality of displaying weather information, with attention to clean code, testing,
and prioritization.

## Installing and using the App:

### Prerequisities:

Install node version 22 (eg. `nvm use 22`), and install yarn (optional).
run `yarn && yarn dev` (or `npm install && npm dev`)

### Running the App locally:
`yarn dev`

### Building the App:
`yarn build`

### Testing the App:
`yarn test:e2e` (See also Playwright test.run.xml in directory `.run`)

Note that the app uses Playwright for end-to-end testing, 
and different values in the .env file lead to different e2e expectations.

## Technical choices:

- The use of Historical and Forecast endpoints can be controlled by an environment variable, 
  also the mocking of all the API calls. (Notably only 100 WeatherStack API calls per month are available for free.)

- Caching mechanism: uses the current "today", not the today of the response. This may lead to faulty caching,
  if the request was sent right before midnight. (This is negligable in practice.)
  (There is a fallback to LocalStorage if the Cache API is not available. I think it is fairly unnecessary though, 
  as ~95% of browsers support the Cache API, without service workers.)

- I used Playwright for testing because it has the reputation to be fast and reliable, so it was interesting to try it out.

- With the styling tried to match the mockup as closely as possible, with colors controlled by CSS variables.
- I usually use frameworks like ChackraUI over Tailwind, but I wanted to try it, and this project was a good opportunity to do so.
- Animations are run using Framer-Motion, otherwise it is difficult to get them smooth with React.
