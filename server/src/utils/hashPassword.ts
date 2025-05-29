import bcrypt from "bcrypt";
import ErrorHandler from "./errorHandler";

const hashPassword = async (password: string) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error hashing password:", error.message);
      throw new ErrorHandler("Error hashing password", 500);
    }
  }
};

export default hashPassword;
// This function hashes a password using bcrypt with a salt round of 10.
