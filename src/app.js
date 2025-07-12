import * as dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

// Express App
const app = express();

// Import routers
const userRouter = require("./routes/userRouter");
const tourRouter = require("./routes/tourRouter");
const categoryRouter = require("./routes/categoryRoute");
const guideRouter = require("./routes/guideRouter");

//    =========    MIDDLEWARE     ========

app.use(express.static(path.join(__dirname, "./public")));

const limiter = rateLimit({
  windowMs: 30 * 60_000,
  max: 5000,
  message: "Too many requests from this IP, please try again later",
});

app.use(limiter);
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// prevent NoSQL query injection
app.use(mongoSanitize());

//* CORS POLICY
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src * ");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
  console.log("Morgan enabled...");
}

// ========   Database Connection   ========
mongoose
  .connect(process.env.DATABASE, { autoIndex: false })
  .then(() => console.log("MONGODB connection successful"))
  .catch((err) => console.log(err));

mongoose.connection.on("disconnected", () => {
  console.log("======= Database Disconnected ======");
});

//*     ~~~~~     ROUTE HANDLERS     ~~~~~
app.get("/api", (req, res) => {
  res.status(200).send({ message: "API is currently running" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/guides", guideRouter);

//! requests that pass the route handlers --> not caught

app.all("*", (req, res, next) => {
  const err = new Error(`No route found at ${req.originalUrl}`);
  if (err.statusCode) err.statusCode = 404;
  next(err);
});

//* GLOBAL ERROR MIDDLEWARE
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  res.status(err.statusCode).send({ message: err });
});

export default app;
