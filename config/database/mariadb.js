const mariadb = require("mariadb");
const _ = require('lodash');
// const logger = require('../winston')

class Maria {
    constructor(oConnParams) {
        this.pool = mariadb.createPool({
            host: oConnParams.host,
            user: oConnParams.user,
            password: oConnParams.password,
            database: oConnParams.database,
            trace: true,
            supportBigNumbers : true,
            connectionLimit: 300,
            typeCast: function (field, next) {
                if (field.type == 'VAR_STRING') {
                    return field.string();
                }
                return( next() );
            }
        });
    }

    async query(sql) {
        let rows = null;
        let conn = null;
        try {
            conn = await this.fetchConn();
            rows = _.difference(await conn.query(sql), ['meta']);
        } catch (error) {
            console.error(error);
            console.error(`[Maria][query][error][${sql}][conn][${JSON.stringify(conn)}][rows][${JSON.stringify(rows)}]`);
        } finally {
            if(conn) {
                conn.release();
            }
            // console.log(`[Maria][query][${sql}][conn][${JSON.stringify(conn)}][rows][${JSON.stringify(rows)}]`);
            // console.log(`[Maria][TotalConnections][${this.pool.totalConnections()}][ActiveConnections][${this.pool.activeConnections()}][IdleConnections][${this.pool.idleConnections()}]`)
            return rows;
        }
    }

    async fetchConn() {
        const conn = await this.pool.getConnection();
        return conn;
    }
}

module.exports = Maria;