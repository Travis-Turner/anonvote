const express = require('express');
const exphbs  = require('express-handlebars');

const PORT = 3000;

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.use("/public", express.static(__dirname + '/public'));
// GET ROUTES
app.get("/", (req, res) => {
  res.render('home');
});
app.get("/register", (req, res) => {
  res.render('register');
});
// POST ROUTES
app.post("/register", (req, res) => {
  res.send('Registration placeholder!');
});

app.listen(PORT, () => {
  console.log('Server up!');
});
