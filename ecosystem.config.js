'use strict';

module.exports = {
    apps: [
        {
            name: "Inquirer Form",
            script: "./index.js",
            watch: false,
            time: true,
            env: {
                NODE_ENV: "production"
            },
            node_args: "--max-old-space-size=1024 --nouse-idle-notification --expose-gc",
        }
    ]
};