require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const bodyParser = require("body-parser");
const { User } = require("./models/user");
const { Movie } = require("./models/movie.js");
const session = require("express-session");
const methodOverride = require('method-override');
const passUserToView = require("./middlewares/pass-user-to-view.js");
// const { auth_middleware } = require("./middlewares/auth");

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
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passUserToView)
// app.use(auth_middleware);

app.get("/", async (req, res) => {
  // get all movies from database
  const movies = await Movie.find();
  // console.log(movies);
  res.render("home.ejs", { movies });
});

//Sign-in/////////////////
app.get("/sign-in", (req, res) => {
  res.render("signIn.ejs");
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  let exists = await User.findOne({ email });

  if (!exists) {
    return res.send("User does not exists");
  }

  const validPassword = bcrypt.compareSync(
    password,
    exists.password
  )

  if (!validPassword) {
    return res.send("Wrong password");
  }
  req.session.user = {
    username: exists.username,
    _id: exists._id
  };

  res.redirect("/");
});
////sign-in portion /////////


//Sign-up portion//////////
app.get("/sign-up", (req, res) => {
  res.render("signUp.ejs");
});

app.post("/user", async (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const username = req.body.username;
  const password1 = req.body.password1;
  const password2 = req.body.password2;

  let exists = await User.findOne({ email });

  if (exists) {
    res.send(`User already exists!`);
  }

  if (password1 !== password2) {
    res.send("Password do not match!")
  }

  const hashedPassword = bcrypt.hashSync(password1, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    username: username
  })

  req.session.user = {
    username: user.username,
    _id: user._id
  };

  res.redirect("/")
});
/////////signup portion////////
app.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

/// Create movie ///
app.get("/create/movies", (req, res) => {
  res.render("movie.ejs")
});
// we need the async function as this involves db queries
app.post("/create/movies", async (req, res) => {
  //receive form data from the body..
  let { image, title, description, rating, duration } = req.body;

  await Movie.create({
    image,
    title,
    description,
    rating,
    duration,
  });

  res.redirect("/")
});
///// create portion done////

//movie detail //////
app.get("/movie/detail", (req, res) => {
  res.render("moviedetail.ejs");
});

////////movie detail //
app.get("/movie/:id", async (req, res) => {
  try {
    const paramId = req.params.id; // Get a id from the url..
    // fetch movie with id from the database
    const movie = await Movie.findById(paramId);

    if (!movie) {
      return res.send("Movie not found");

    }
    /// send the movie to ejs and render on the page//
    res.render("moviedetail.ejs", { movie })
  } catch {
    // console.error("Error fetching movie details:", error);
    res.send("Internal Server Error");
  }
})

// edit movie path
app.get("/movie/edit/:id", async (req, res) => {
  // Get the ID from the URL
  try {
    // Get the ID from the URL
    const paramId = req.params.id;
    // Fetch movie with id from the database
    const movie = await Movie.findById(paramId);
    if (!movie) {
      return res.send("Movie not found");
    }
    // Send the movie to ejs and render on the page 
    res.render("editmovie.ejs", { movie });
  } catch (error) {
    res.send("Internal Server Error");
  }
});

// inside server.js
app.put("/update/movies/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the URL parameters

  const { title, image, description, duration, rating } = req.body; // Extract other fields from the request body

  try {
    // Find the movie by ID and update it
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      {
        title,
        image,
        description: description,
        duration: duration,
        rating: rating,
      },
      { new: true }, // Return the updated document
    );

    if (!updatedMovie) {
      return res.status(404).send("Movie not found");
    }

    // Redirect or respond with the updated movie
    res.redirect(`/movie/${id}`); // Redirect to updated page
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).send("Internal server error");
  }
});

app.delete("/movies/:movieId", async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.movieId);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.listen(3000);