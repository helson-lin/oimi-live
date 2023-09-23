const { bootstrap } = require('..')
const chalk = require('chalk')
const figlet = require('figlet')
console.log(chalk.greenBright.bold.italic.dim(figlet.textSync("Oimi Live", 'ANSI Shadow')));

bootstrap()