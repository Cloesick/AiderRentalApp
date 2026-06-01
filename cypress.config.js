const windsurfReporter = require('./cypress/plugins/windsurf-reporter');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {

  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mochawesome, mocha-junit-reporter',
    mochawesomeReporterOptions: {
      reportDir: 'cypress/results/mochawesome',
      overwrite: false,
      html: true,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/results/junit/results-[hash].xml'
    }
  },
  env: {
    windsurfLearning: {
      enabled: true,
      captureScreenshots: true,
      captureVideos: true,
      analyzePatterns: true,
      createMemories: true,
      insightsPath: 'cypress/insights'
    }
  },
    baseUrl: null, // No server required
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      windsurfReporter(on, config);

      return config;
    },
  },
});
