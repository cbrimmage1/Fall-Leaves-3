// connect the connect.js file
let connect = require("./connect.js");

// set up server
let express = require('express');
let app = express();

// serve src files
app.use(express.static('public'));
app.use(express.json()); //parse the data

// import cors
let cors = require("cors");
app.use(cors());

// setup port
let port = 3000;
app.listen(port, () => {
    connect.connectToServer()
    console.log(`Server is listening on localhost: ${port}`);
});

/*DATABASE */
const { Database } = require('quickmongo');
const db = new Database(process.env.MONGO_URI);

db.on('ready', () => {
  console.log('Connected to the database');
});
db.connect();

// --------- set up routes --------- //

app.get('/messages', (request, response) => {
  //get data from the db
  db.get('messages')
  .then(data => {
    console.log(data);
    let messages = data;
    let messagesData = {
      data: messages
    }
    response.json(messagesData);
  })
});