const MariaDB = require('./mariadb');
const _ = require('lodash');
// const logger = require('../winston')


class RobotxtMaria extends MariaDB {
    constructor() {
        const oConnParams = {
            host: '158.247.225.228',
            user: 'htbstmvket',
            password: 'e8Sqwk3ujc',
            database: 'htbstmvket',
        }
        super(oConnParams)
    }
}

module.exports = new RobotxtMaria();