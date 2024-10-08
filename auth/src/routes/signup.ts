import express, { Request, Response } from "express";
import "express-async-errors";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";
import { RequestValidationError } from "../errors/request-validation-errors";
import { User } from "../models/user";
import { validateRequest } from "../middlewares/validate-request";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("Creating a user ...");

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("email in use");
      throw new BadRequestError("Email in use");
    }

    const user = User.build({
      email: email,
      password: password,
    });

    await user.save();

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    return res.status(201).send(user);
  }
);

export { router as signupRouter };
