const MariaDB = require('./mariadb');
const _ = require('lodash');
// const logger = require('../winston')


class HotpayMaria extends MariaDB {
    constructor() {
        const oConnParams = {
            host: '158.247.194.44',
            user: 'cngyntgzww',
            password: 'TyA8eee3Hf',
            database: 'cngyntgzww',
        }
        super(oConnParams)
    }
}

module.exports = new HotpayMaria();