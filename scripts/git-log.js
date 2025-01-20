const { exec } = require('child_process');
const fs = require('fs');

exec("git log >> logs/git.log", (e, stdout, stderr) => {
    if (e) return console.error(e);
    if (stderr) console.warn(stderr);
    console.log(stdout);
});