import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import { json } from "body-parser";
import { currentuserRouter } from "./routes/current-user";
import { signoutRouter } from "./routes/signout";
import { siginRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import "express-async-errors";
import mongoose from "mongoose";

const app = express();

app.set("trust proxy", true);
app.use(json());

app.use(
  cookieSession({
    signed: true,
    secure: true,
    keys: ["key1"],
  })
);

app.use(currentuserRouter);
app.use(signoutRouter);
app.use(siginRouter);
app.use(signupRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("Key not found");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to mongodb");
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
