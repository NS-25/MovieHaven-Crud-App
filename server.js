require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { User } = require("./models/user");
const { Movie } = require("./models/createmovie");
const session = require("express-session");
const { auth_middleware } = require("./middlewares/auth");




const app = express();


// DB_URL import here
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL).then(() => console.log("DB Connected")).catch((e) => {
  console.log(e);
  console.log("DB connection failed!")
});

//////////////////////////////////////////

//static folder in css /// using use key word all are middleware....
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(auth_middleware);


app.get("/", (req, res) => {
  res.render("home.ejs");
});

//Sign-in
app.get("/sign-in", (req, res) => {
  res.render("signIn.ejs");
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  let exists = await User.findOne({ email });

  if (!exists) {
    return res.send("User does not exists");
  }
  if (exists.password !== password) {
    return res.send("Wrong password");
  }
  req.session.user = exists;
  res.redirect("/");
});








//Sign-up
app.get("/sign-up", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/user", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password1 = req.body.password1;
  const password2 = req.body.password2;

  let exists = await User.findOne({ email });
  console.log(exists);
  if (exists) {
    res.send(`User already exists!`);
  }

  if (password1 !== password2) {
    res.send("Password do not match!")
  }
  await User.create({
    email,
    password: password1,
  })

  res.send(`User created ${email}  ${password1} ${password2}`)
});
/////////signup////////
/// Create movie ///
app.get("/create/movies", (req, res) => {
  res.render("createmovie.ejs")
});



app.listen(3000);