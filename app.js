const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const PORT = process.env.PORT || 3000;

dotenv.config({ path: path.resolve(__dirname, ".env"), override: true });
const DB_URI = process.env.DB_URI || "mongodb://127.0.0.1:27017/jobportal";
mongoose.set("strictQuery", false);

async function startServer() {
  try {
    await mongoose.connect(DB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    if (err.code === "ENOTFOUND" && DB_URI.startsWith("mongodb+srv://")) {
      console.warn("Atlas DNS lookup failed. Falling back to local MongoDB at mongodb://127.0.0.1:27017/jobportal");
      await mongoose.connect("mongodb://127.0.0.1:27017/jobportal");
      console.log("MongoDB connected to local instance");
    } else {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
  });
}

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

startServer();
