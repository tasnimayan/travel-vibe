require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose')



// Express App
const app = express();

// Import routers
const userRouter = require('./src/routes/userRouter')
const tourRouter = require('./src/routes/tourRouter');
// const userRouter = require('./routes/user-routes');
// const reviewRouter = require('./routes/review-routes');
// const viewRouter = require('./routes/view-routes');
// const bookingRouter = require('./routes/booking-routes');

// Render pug template


//    =========    MIDDLEWARE     ========

console.log(path.join(__dirname, './public'));
app.use(express.static(path.join(__dirname, './public')));

const limiter = rateLimit({
	windowMs: 30 * 60_000,
	max: 5000,
	message: 'Too many requests from this IP, please try again later',
});


app.use(limiter);
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());


// prevent NoSQL query injection 
app.use(mongoSanitize());


//* CORS POLICY
app.use((req, res, next) => {
	res.setHeader('Content-Security-Policy', 'script-src * ');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('tiny'));
	console.log('Morgan enabled...');
}


// ========   Database Connection   ========
mongoose
  .connect(process.env.DATABASE, {autoIndex:false})
  .then(() => console.log('MONGODB LOCAL connection successful'))
  .catch(err => console.log(err));

mongoose.connection.on('disconnected', () => {
	console.log("======= Database Disconnected ======");
});

//*     ~~~~~     ROUTE HANDLERS     ~~~~~


app.use('/api/users', userRouter);
app.use('/api/tours', tourRouter);
// app.use('/api/reviews', reviewRouter);
// app.use('/api/bookings', bookingRouter);
// app.use('/', viewRouter);

//! requests that pass the route handlers --> not caught

app.all('*', (req, res, next) => {
	const err = new Error(`No route found at ${req.originalUrl}`);
	if (!err.statusCode) err.statusCode = 404;
	next(err);
});

//* GLOBAL ERROR MIDDLEWARE
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	res.status(err.statusCode).send({ message: err.message });
});

module.exports = app;