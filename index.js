import events from "events"
import mysql from "mysql";
import fp from 'fastify-plugin';

/**
 * connect to MYSQL Database..
 * 
 * this is a long live connection and not a connection pool
 */
const Mysql = fp(async function (fastify, options) {
    const {
        DATABASE_INFO: DATABASE_INFO = {
            host: 'localhost',
            user: '',
            password: '',
            database: ''
        }
    } = options;

    const {WAIT_TIME: WAIT_TIME = 5000} = options;

    const {MODULE: MODULE = mysql} = options;

    // test connection 
    const connection = MODULE.createConnection(DATABASE_INFO);

    const emitter = new events.EventEmitter();
    // store test connection
    fastify.decorate('DB', connection);

    fastify.decorate('DB_INFO', emitter);

    const CONNECT = async function () {
        try {
            // new connection
            const new_connection = await new Promise(async (resolve, reject) => {

                if (connection.state === "disconnected") {

                    const connection = MODULE.createConnection(DATABASE_INFO);

                    connection.connect(function (error) {
                        if (error) {
                            const code = error.code;
                            const message = error.message;
                            emitter.emit("reconnect_error", code, message)
                            setTimeout(CONNECT, WAIT_TIME);
                        } else {
                            resolve(connection);
                        }

                    });
                } else {
                    reject('already connected');
                }

            });

            fastify.DB = new_connection;

            emitter.emit("connect", true)

            fastify.DB.on('error', function (error) {
                const code = error.code;
                emitter.emit("disconnect", code)
                fastify.DB.destroy();
                CONNECT();
            });
        } catch (e) {
            emitter.emit("connect", true)
            fastify.DB.on('error', function (error) {
                const code = error.code;
                emitter.emit("disconnect", code);
                fastify.DB.destroy();
                CONNECT();
            });
        }
    }
    CONNECT()


})

export default Mysql;