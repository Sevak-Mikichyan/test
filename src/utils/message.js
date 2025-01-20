const chalk = require('chalk');

class Message {
    static success(message, value) {
        const success = `${chalk.green("✓ Success")} ${message}: ${chalk.yellow("`" + value + "`")}`;
        console.log(success);
        return success;
    }

    static error(message, e) {
        const failure = `${chalk.red(`✗ Error`)} ${message}`;
        console.error(failure, "\n", e);
        return failure;
    }
}

module.exports = { Message };