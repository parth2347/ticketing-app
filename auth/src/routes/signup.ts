import express, { Request, Response } from "express";
import 'express-async-errors';
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-errors";
import { User } from "../models/user";
import { BadRequestError } from "../errors/bad-request-error";

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
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;
    console.log("Creating a user ...");

    const existingUser = await User.findOne({email});
    if(existingUser){
      console.log("email in use");
      throw new BadRequestError("Email in use");
    }

    const user = User.build({
      email: email ,
      password: password
    });

    await user.save();
    return res.status(201).send(user);
  }
);

export { router as signupRouter };
