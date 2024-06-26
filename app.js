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
const categoryRouter = require('./src/routes/categoryRoute');
const guideRouter = require('./src/routes/guideRouter')


//    =========    MIDDLEWARE     ========

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
  .then(() => console.log('MONGODB connection successful'))
  .catch(err => console.log(err));

mongoose.connection.on('disconnected', () => {
	console.log("======= Database Disconnected ======");
});


//*     ~~~~~     ROUTE HANDLERS     ~~~~~
app.get('/api', (req, res)=>{
	res.status(200).send({message:"API is currently running"})
})

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/guides', guideRouter);


//! requests that pass the route handlers --> not caught

app.all('*', (req, res, next) => {
	const err = new Error(`No route found at ${req.originalUrl}`);
	if (!err.statusCode) err.statusCode = 404;
	next(err);
});

//* GLOBAL ERROR MIDDLEWARE
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	res.status(err.statusCode).send({ message: err });
});

module.exports = app;