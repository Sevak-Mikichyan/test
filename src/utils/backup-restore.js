const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const { exec } = require('child_process');

const PSQL_USERNAME = process.env.PSQL_USERNAME;
const PSQL_PASSWORD = process.env.PSQL_PASSWORD;
const PSQL_DATABASE = process.env.PSQL_DATABASE;


module.exports = {
    backup: (fileName) => {
        return new Promise((resolve, reject) => {
            try {
                const backupDir = path.join(__dirname, "../../backups");
                const backupPath = path.resolve(backupDir, fileName);
                const backupCommand = `pg_dump -U ${PSQL_USERNAME} -d ${PSQL_DATABASE} -f "${backupPath}"`;

                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                    console.log(`Backup directory created: ${backupDir}`);
                }

                exec(backupCommand, { env: { ...process.env, PGPASSWORD: PSQL_PASSWORD } }, (e, stdout, stderr) => {
                    if (e) reject(e);
                    if (stderr) console.warn(stderr);
                    if (stdout) console.log(stdout);
                    resolve(backupPath);
                });
            } catch (e) {
                reject(e);
            }
        });
    },

    restore: (fileName) => {
        return new Promise((resolve, reject) => {
            try {
                const backupPath = path.resolve(__dirname, "../../backups", fileName);
                if (!fs.existsSync(backupPath)) {
                    throw new Error(`Backup file not found: ${backupPath}`);
                }

                const restoreCommand = `psql -U ${PSQL_USERNAME} -d ${PSQL_DATABASE} -f "${backupPath}"`;
                exec(restoreCommand, { env: { ...process.env, PGPASSWORD: PSQL_PASSWORD } }, (e, stdout, stderr) => {
                    if (e) reject(e);
                    if (stderr) console.warn(stderr);
                    if (stdout) console.log(stdout);
                    resolve(`Restore completed successfully from: ${backupPath}`);
                });
            } catch (e) {
                reject(e);
            }
        });
    }
};