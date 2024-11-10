if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}
const helmet = require('helmet')
const express = require('express')
const mongoSanitize = require('express-mongo-sanitize')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError.js')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user.js')
const MongoStore = require('connect-mongo');
const userRoutes = require('./routes/user.js')
const campgroundRoutes = require('./routes/campground.js')
const reviewRoutes = require('./routes/reviews.js')

// 'mongodb://localhost:27017/yelp-camp'
// 
const dbUrl = process.env.DB_URL

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.error("Database connection error:", error);
    });



const app = express()
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dcfdglofy/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize())
app.use(passport.session()) // for persistent login session and it should below session(actual)
passport.use(new localStrategy(User.authenticate()))


// serialize - Saves only the necessary data in the session store
// For example :- If a user object has various details (ID, name, email, etc.), only the user.id might be serialized and stored in the session. Later, this user.id will be used to retrieve the full user details.


passport.serializeUser(User.serializeUser()) // how do we store user in session
passport.deserializeUser(User.deserializeUser()) // how do we get user out of session or unstore user in session

// deserialize - Takes the unique identifier (like user.id from serialization) and fetches the complete user object from the database or another data store. Allows access to the full user information (like username, email, etc.) whenever it’s needed in requests, without requiring all user data in the session.

app.use((req,res,next)=>{
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl
        console.log(req.originalUrl)
    }
    res.locals.currentUser = req.user
    res.locals.success = req.flash
    ('success')
    res.locals.error=req.flash('error')
    next();
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)


app.get('/',(req,res)=>{
    res.render("home")
})



app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found!!',404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Ohh Noo!! Something went wrong!!';
    res.status(statusCode).render('error', { err });
});


app.listen(3000,()=>{
    console.log('Serving on port 3000...')
})