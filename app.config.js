require('dotenv/config');
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      claudeApiKey: process.env.CLAUDE_API_KEY,
    },
  },
};
