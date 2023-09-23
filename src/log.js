const log4js = require("log4js");
const path = require("path")

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: { type: 'dateFile', filename: path.join(process.cwd(), '/logs/app.log'), pattern: 'yyyy-MM-dd.log', daysToKeep: 3, backups: 3, maxLogSize: 10240 }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
  },
});
const logger = log4js.getLogger();
module.exports = logger