/// importing the dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
//npm  uuidv4
const { v4: uuidv4 } = require("uuid");
const { Event } = require("../models/event");
const { User } = require("../models/user");

const uri =
  "mongodb+srv://admin:pAsSwOrD321@dev-cluster.fcuvf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri);

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

//sign up
app.post("/signup", async (req, res)=>{
  const newUser = req.body;
  // if(User.includes({ userName: req.body.userName })){
  //  return next(createError(400, `This username "${req.body.userName}" already has an account.`))
  // }
  const user = new User(newUser);
  await user.save();
  res.send({ message: "New profile created." });

});

//auth
app.post("/auth", async (req, res) => {
  const user = await User.findOne({ userName: req.body.userName });
  if (!user) {
    return res.sendStatus(401);
  }
  //hash passwords never in plain text
  if (req.body.password !== user.password) {
    return res.sendStatus(403);
  }
  user.token = uuidv4();
  await user.save();

  res.send({ token: user.token });
});
//gatekeeper function unless it passes auth

app.use(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const user = await User.findOne({ token: authHeader });

  if (user) {
    next();
  } else {
    res.sendStatus(403);
  }
});

// defining CRUD operations
app.get("/event", async (req, res) => {
  res.send(await Event.find());
});

app.post("/event", async (req, res) => {
  console.log(req.body);
  const newEvent = req.body;
  const event = new Event(newEvent);
  await event.save();
  res.send({ message: "New event added." });
});

app.delete("/event/:id", async (req, res) => {
  await Event.deleteOne({ _id: ObjectId(req.params.id) });
  res.send({ message: "Event removed." });
});

app.put("/event/:id", async (req, res) => {
  await Event.findOneAndUpdate({ _id: ObjectId(req.params.id) }, req.body);
  res.send({ message: "Event updated." });
});

app.get("/search/id/:id", async (req, res) => {
  await Event.findOne({ _id: ObjectId(req.params.id) }).then((item) => {
    if (!item) next(createError(404, "No event with that id exists."));
    if (item) res.send(item);
  });
});

app.get("/search/name/:name", async (req, res) => {
  await Event.findOne({ name: req.params.name }).then((item) => {
    if (!item) next(createError(404, `No event named ${req.params.name} exists.`));
    if (item) res.send(item);
  });
});

app.get("/search/location/:location", async (req, res) => {
  await Event.find({ location: req.params.location }).then((item) => {
    if (!item) next(createError(404, `There are no events at ${req.params.location}.`));
    if (item) res.send(item);
  });
});

app.get("/search/date/:date", async (req, res) => {
  await Event.find({ date: req.params.date }).then((item) => {
    if (!item) next(createError(404, `There are no events on the ${req.params.date}.`));
    if (item) res.send(item);
  });
});

// starting the server
app.listen( process.env.PORT || 3001, () => {
  console.log("listening on port");
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Database connected!");
});
