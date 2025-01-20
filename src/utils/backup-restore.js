const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const { exec } = require('child_process');

const PG_USERNAME = process.env.PG_USERNAME || "postgres";
const PG_PASSWORD = process.env.PG_PASSWORD || "root";
const PG_DATABASE = process.env.PG_DATABASE || "database";


module.exports = {
    backup: (fileName) => {
        return new Promise((resolve, reject) => {
            try {
                const backupDir = path.join(__dirname, "../../backups");
                const backupPath = path.resolve(backupDir, fileName);
                const backupCommand = `pg_dump -U ${PG_USERNAME} -d ${PG_DATABASE} -f "${backupPath}"`;

                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                    console.log(`Backup directory created: ${backupDir}`);
                }

                exec(backupCommand, { env: { ...process.env, PGPASSWORD: PG_PASSWORD } }, (e, stdout, stderr) => {
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

                const restoreCommand = `psql -U ${PG_USERNAME} -d ${PG_DATABASE} -f "${backupPath}"`;
                exec(restoreCommand, { env: { ...process.env, PGPASSWORD: PG_PASSWORD } }, (e, stdout, stderr) => {
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