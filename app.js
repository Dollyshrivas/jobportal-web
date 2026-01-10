require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const flash = require("connect-flash")
const PORT= process.env.PORT ||3000;

// database connection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//cookie middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

//middleware
const session = require("express-session");

app.use(
  session({
    secret:"My secret key",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 6000 * 64 * 24 * 7  //1 week
    }
  })
);

//flash message
app.use(flash());

//store flash message
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//store authenticated user's session data for views
app.use((req,res,next)=>{
  res.locals.user = req.session.user || null;
  next();
})

  
//templeting engine
app.set("view engine", "ejs");

//Routing
const route = require("./routes/routes"); 
app.use("/", route);

const authroute = require("./routes/authRoutes");
app.use("/", authroute);


app.listen(PORT,()=>{
  console.log(`server is running on http://localhost:${PORT}`)
})
