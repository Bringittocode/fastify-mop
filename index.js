import events from "events";
import fp from 'fastify-plugin';

/**
 * connect to MYSQL Database..
 * 
 * this is a long live connection and not a connection pool
 */
const SQL = fp(async function (fastify, options) {
    const {
        DATABASE_INFO: DATABASE_INFO = {
            host: 'localhost',
            user: '',
            password: '',
            database: ''
        }
    } = options;

    const {USE_NAME: USE_NAME = "DB"} = options;

    const {USE_EVENT_NAME: USE_EVENT_NAME = "DB_INFO"} = options;

    const {WAIT_TIME: WAIT_TIME = 5000} = options;

    let {MODULE: MODULE} = options;

    if(MODULE === undefined){
        MODULE = await import('mysql2');
    }

    const emitter = new events.EventEmitter();
    fastify.decorate(USE_EVENT_NAME, emitter);

    try
    {
        // test connection 
        const mysql_connection = MODULE.createConnection(DATABASE_INFO);

        // store test connection
        fastify.decorate(USE_NAME, mysql_connection);

        const CONNECT = async function () {
            try {
                // new connection
                const new_mysql_connection = await new Promise(async (resolve, reject) => {

                    if(mysql_connection.state)
                    {
                        if (mysql_connection.state === "disconnected") {

                            const mysql_connection = MODULE.createConnection(DATABASE_INFO);

                            mysql_connection.connect(function (error) {
                                if (error) {
                                    const code = error.code;
                                    const message = error.message;
                                    emitter.emit("reconnect_error", code, message)
                                    setTimeout(CONNECT, WAIT_TIME);
                                } else {
                                    resolve(mysql_connection);
                                }

                            });
                        } else {
                            reject('already connected');
                        }
                    }
                    else{
                        const mysql_connection = MODULE.createConnection(DATABASE_INFO);

                        mysql_connection.connect(function (error) {
                            if (error) {
                                const code = error.code;
                                const message = error.message;
                                emitter.emit("reconnect_error", code, message)
                                setTimeout(CONNECT, WAIT_TIME);
                            } else {
                                resolve(mysql_connection);
                            }

                        });
                    }
                });

                fastify[USE_NAME] = new_mysql_connection;

                emitter.emit("connect", true)

                fastify[USE_NAME].on('error', function (error) {
                    const code = error.code;
                    const message = error.message;
                    emitter.emit("disconnect", code, message)
                    fastify[USE_NAME].destroy();
                    CONNECT();
                });
            } catch (e) {
                emitter.emit("connect", true)
                fastify[USE_NAME].on('error', function (error) {
                    const code = error.code;
                    const message = error.message;
                    emitter.emit("disconnect", code, message);
                    fastify[USE_NAME].destroy();
                    CONNECT();
                });
            }
        }

        CONNECT()
    }
    catch(e){
        const { Client } = MODULE;
        fastify.decorate(USE_NAME, '');

        const CONNECT = async function () {

            const client = new Client(DATABASE_INFO);
            // store test connection
            fastify[USE_NAME] = client;
            client
            .connect()
            .then(() => {
                
                emitter.emit("connect", true);

                fastify[USE_NAME].on('error', function(error) {
                    fastify[USE_NAME].end()
                    const code = error.code;
                    const message = error.message;
                    emitter.emit("disconnect", code, message)
                    setTimeout(CONNECT, WAIT_TIME);
                });
            })
            .catch(error => {
                const code = error.code;
                const message = error.message;
                emitter.emit("reconnect_error", code, message)
                setTimeout(CONNECT, WAIT_TIME);
            })
        }
        
        CONNECT();
    }

})

export default SQL;