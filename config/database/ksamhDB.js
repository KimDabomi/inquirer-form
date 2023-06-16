const MariaDB = require('./mariadb');
const _ = require('lodash');
// const logger = require('../winston')


class KsamhMaria extends MariaDB {
    constructor() {
        const oConnParams = {
            host: '158.247.236.132',
            user: 'rwxaubrmvx',
            password: 'bnYsMN8HQu',
            database: 'rwxaubrmvx',
        }
        super(oConnParams)
    }
}

module.exports = new KsamhMaria();