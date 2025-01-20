const { exec } = require('child_process');
const fs = require('fs');

if (fs.existsSync('node_modules')) {
    exec("rm -rf node_modules && npm install", (e, stdout, stderr) => {
        if (e) return console.error(e);
        if (stderr) console.warn(stderr);
        console.log(stdout);
    });
} else {
    console.log("node_modules folder does not exist.");
}