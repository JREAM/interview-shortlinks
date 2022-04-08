// .env
require('dotenv-safe').config();
const { SERVE_HOSTNAME, SERVE_PORT } = require('../src/config.json');
const cookieSession=require('cookie-session');
const { v4: uuid, v4 } = require('uuid')
const cors = require('cors');

const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(cors());

// DATABASE  (/.env)
// mysql-u root-proot-e 'CREATE DATABASE shortlinks'
// Look in JESSE.md

const knex = require('knex')({
  client: 'mysql',
  debug: false,
  connection: {
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
  }
});

// dirty debug
// console.log(process.env)
// knex.raw("SELECT 1").then(() => {console.log("knex CONNECTED");}).catch((e) => {console.log("knex NOT connected");console.error(e);});

// Cookie (Whats this used for? Fake Auth?)
app.use(cookieSession({
  name: 'shortlinks',
  keys: [process.env.SESHSECRET],
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
}))

// Allow CORS Requests, passes Fake Cookie/Session ID via UUID?
app.use(function(req, res, next) {
  // console.log(`${req.method} ${req.url}`);
  req.session.id = (req.session.id || uuid());
  res.header('Access-Control-Allow-Origin', '*');
  next(); // pass control to the next handler
});

/**
 * PAGE
 * */
app.get('/', (req, res) => {
  res.json({
    backend: 'OK',
    session_id: req.session.id
  });
  // [X] No User Auth Needed -- Basically if they KNEW the url they could ADD links :)
})



/**
 * API: GET all links
 */
app.get(
  '/api/links',
  (req, res, next)=> {
    knex.select('uuid', 'url').from('links')
      .then((data) => {
        // I only call "result" so axios isnt: axios.data.data
        return res.json({ error: false, result: data })
      }).catch((e) => {
        return res.json({ error: true, e })
      })
  }
)

/**
 * API: CREATE new link
 */
app.post(
  '/api/links', // Im leaving it PLURAL so it follows REST get/post convention (though its not LITERALLY plural)
  (req, res)=> {

    // Could do UPSERT on the UUID but its just a mockup who cares, and the USER would want to know an UPDATE happened to an existing URL.
    const url = req.body.url
    const uuid = v4(url)

    const payload={
      uuid, url
    }
    // return res.json(payload)
    console.log(payload)

    knex('links').insert(payload).then((data) => {
      return res.json({ error: false, result: data })
    }).catch((e) => {
      console.log(e)
      return res.json({ error: true, e })
    });
  }
)

/**
 * API: DELETE link
 */
app.post(
  '/api/links', // Im leaving it PLURAL so it follows REST get/post convention (though its not LITERALLY plural)
  (req, res)=> {

    // Could do UPSERT on the UUID but its just a mockup who cares, and the USER would want to know an UPDATE happened to an existing URL.
    const uuid = req.body.uuid

    knex('links').delete('uuid', uuid).then((data) => {
      return res.json({ error: false, result: data })
    }).catch((e) => {
      console.log(e)
      return res.json({ error: true, e })
    });
  }
)


/**
 * API: Get ONE link
 * I dont think I need this, or Im not using it yet
 */
// app.get(
//   '/api/links/:id',
//   (req, res, next)=> {
//     // res.send(`Id=${req.params.id}`);
//     next();
//   }
// )

/**
 * REDIRECT
 * Place AFTER all other URI's so it doesnt try to load /api-* or something (Just thinking)
 * */
 app.get('/:id', (req, res, next) => {
  try {
    const uuid=req.params.id;
    knex.from('links').where({uuid}).limit(1) // uuid: uuid is a ? prepared query so no SQL Injection w/knex
      .then((data) => {
      res.redirect(data[0].url) // bounce outta here, validate the INPUT in a real app (before its in DB)
    }).catch((e) => {
      return res.json({ error: true, e })
    })

    // res.redirect(data[0].url);
  } catch (e) {
    return res.json({ error: true, e })
  }

})


app.listen(
  SERVE_PORT,
  SERVE_HOSTNAME,
  ()=> console.log(`Shortlinks backend listening on ${SERVE_HOSTNAME}:${SERVE_PORT}!`)
)
