const log4js = require("log4js");
const path = require("path")
log4js.configure({
    appenders: {
      console: { type: 'console' },
      file: { type: 'file', filename: path.join(process.cwd(), "logs/app.log") },
    },
    categories: {
      default: { appenders: ['console', 'file'], level: 'info' },
    },
  });
const logger = log4js.getLogger();
module.exports = logger