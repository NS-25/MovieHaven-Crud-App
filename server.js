const express = require("express");
const app = express();


//static folder in css
app.use(express.static("static"));



app.get("/",(req,res) => {
res.render("home.ejs");
});

//Sign-in
app.get("/sign-in", (req, res) => {
  res.render("signIn.ejs");
});




app.listen(3000);