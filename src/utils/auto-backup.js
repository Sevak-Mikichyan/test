const path = require('path');
const fs = require('fs');
const { backup } = require('./backup-restore');

const autoBackup = (maxBackups) => {
    return new Promise(async (resolve, reject) => {
        const backupDir = path.join(__dirname, "../../backups");
        try {
            const timestamp = new Date().toISOString().slice(0, 10);
            try {
                var backupMessage = await backup(`pg-backup_${timestamp}.sql`);
            } catch (e) {
                return reject(e);
            }
            const files = fs.readdirSync(backupDir).filter(file => file.endsWith(".sql"));
            if (files.length > (maxBackups - 1)) {
                files.sort((a, b) => fs.statSync(path.join(backupDir, a)).mtimeMs
                    - fs.statSync(path.join(backupDir, b)).mtimeMs);
                const fileToDelete = path.join(backupDir, files[0]);
                fs.unlinkSync(fileToDelete);
            }
            return resolve(backupMessage);
        } catch (e) {
            return reject(e);
        }
    });
};

module.exports = { autoBackup };