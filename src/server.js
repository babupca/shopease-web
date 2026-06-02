'use strict';
const { createApp } = require('./app');
const { config } = require('./config');

const port = process.env.PORT || config.app.port;
createApp().listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`${config.app.name} listening on http://localhost:${port} (env=${config.env})`);
});
