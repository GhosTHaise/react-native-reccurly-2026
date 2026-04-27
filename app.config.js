const appJson = require('./app.json')

export default {
  expo: {
    ...appJson.expo,
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      eas: {
        projectId: "8558d3c4-888e-4521-9543-269ce0784a36"
      }
    },
  },
}
