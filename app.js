const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/user");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderful";

async function startServer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to DB");

        // Set up Express app
        app.set("view engine", "ejs");
        app.set("views", path.join(__dirname, "views"));
        app.engine("ejs", ejsMate);
        app.use(express.urlencoded({ extended: true }));
        app.use(methodOverride("_method"));
        app.use(express.static(path.join(__dirname, "public"))); // Serve static files from public
        app.use(helmet());

        // Session configuration
        const sessionSecret = process.env.SECRET || "default-secret";
        const sessionOptions = {
            secret: sessionSecret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' // Ensure secure cookies in production
            },
        };
        app.use(session(sessionOptions));
        app.use(flash());

        // Passport setup
        app.use(passport.initialize());
        app.use(passport.session());
        passport.use(new LocalStrategy(User.authenticate()));
        passport.serializeUser (User.serializeUser ());
        passport.deserializeUser (User.deserializeUser ());

        // Middleware for flash messages and current user
        app.use((req, res, next) => {
            res.locals.success = req.flash('success');
            res.locals.error = req.flash('error');
            res.locals.currUser  = req.user;
            next();
        });

        // Route Handlers
        app.get("/", (req, res) => res.render("index"));
        app.use('/listings', listingsRouter);
        app.use('/listings/:id/reviews', reviewsRouter);
        app.use('/', userRouter);

        // Error handling
        app.all("*", (req, res, next) => {
            next(new ExpressError(404, "Page Not Found!"));
        });

        app.use((err, req, res, next) => {
            const { statusCode = 500, message = "Something went wrong" } = err;
            res.status(statusCode).render("error", { err });
        });

        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error("Error starting server:", err);
    }
}

startServer();