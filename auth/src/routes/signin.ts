import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-errors";
import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";
import { Password } from "../services/password";
const router = express.Router();

router.get(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials !");
    }

    const passwordMatches = Password.comparePassword(
      existingUser.password,
      password
    );
    if (!passwordMatches) {
      throw new BadRequestError("Invalid credentials");
    }

    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    return res.status(200).send(existingUser);
  }
);

export { router as siginRouter };
