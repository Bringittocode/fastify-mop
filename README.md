# fastify-mop
create a long live connection between your application and mysql in fastify. this is not mysql pool.

this package helps you to manage auto reconnection.

you still have the complete features of mysql in nodejs except for mysql pool

## INSTALLATION
> npm i @bringittocode/fastify-mop

## USAGE

### import the module
```js
import mysql from "@bringittocode/fastify-mop";
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
});
```

> DATABASE_INFO => your database detailes.

> WAIT_TIME => how many miliseconds to wait before reconnecting if there is any disconnection

After registering you then have mysql instance in all of your application
```js
//mysql instance
fastify.DB

//use to listen on events
fastify.DB_INFO
```

what you have to do is to focus on your query as you would if no package is used

learn more => https://www.npmjs.com/package/mysql;

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