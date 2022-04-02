# fastify-mop
create a long live connection between your application and mysql in fastify. this is not mysql pool.

this package helps you to manage auto reconnection.

you still have the complete features of mysql in nodejs except for mysql pool

## INSTALLATION
> npm i @bringittocode/fastify-mop@latest

## FEATURES

* One library rule them all... i.e you can use any mysql module with this library to manage connection.
* Auto reconnection if connection timeout or an error occured
* You still have all the method of [MYSQL2](https://www.npmjs.com/package/mysql2) except for pool.
* You have an event to listen on if connection failed or successful

## USAGE

### import the module
```js
import mysql from "@bringittocode/fastify-mop";
// Import any mysql module you wish to use
import mysql from "mysql";

//OR
const mysql = require('@bringittocode/fastify-mop');
// Import any mysql module you wish to use
const mysql2 = require("mysql2");
```

### Register the module
```js
fastify.register(mysql,{
    DATABASE_INFO: {
        host: "",
        user: "",
        password: "",
        database: "",
    },
    WAIT_TIME: 2000,
    MODULE: mysql //mysql2
});
```

> DATABASE_INFO => your database detailes... you can also put any valid MYSQL initialization option.

> WAIT_TIME => how many miliseconds to wait before reconnecting if there is any disconnection.. DEFAULT 5 seconds

> MODULE => Any MYSQL module you wish to use.. DEFAULT [MYSQL2](https://www.npmjs.com/package/mysql2)

After registering you then have mysql instance in all of your application
```js
//mysql instance
fastify.DB

//use to listen on events
fastify.DB_INFO
```

what you have to do is to focus on your query as you would if no package is used

> CURRENTLY SUPPORTED MODULE.

* [MYSQL](https://www.npmjs.com/package/mysql)
* [MYSQL2](https://www.npmjs.com/package/mysql2)

```js
    const query = "SELECT * FROM your_table where ?";
    fastify.DB.query(query, ["user"], function (err, result) {
        try {
            if (err) throw err;
            //manage result
        }
        catch(err)
        {
            //manage error
        }
    });
```
> NOTE :: do not disconnect after you finish... your connection is meant to stay alive so you can query your database at anytime

## Event

event must be inside fastify ready function to avoid error
```js
fastify.ready()
    .then(() => {

        // listen for connection and reconnection
        // status => boolean
        fastify.DB_INFO.on("connect",(status)=>{
            console.log('database connected');
        });

        // listen for reconnection error
        // code => error code
        // message => error message
        fastify.DB_INFO.on("reconnect_error", (code,message) => {
            console.log(code, message);
        });

        // listen for disconnection ...this can be for many reason
        fastify.DB_INFO.on("disconnect", (code) => {
            console.log(code);
        });
    })
```

That all you need.
We are finding who can add typescript to this package

feel free to pull request and contribute....

any issue feel free as well.