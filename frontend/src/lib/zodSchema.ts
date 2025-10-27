import z from "zod";

export const registerFormSchema = z.object({
  username: z.string().min(5, {
    message: "Username must be at least 5 characters.",
  }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string(),
  // .min(8, {
  //   message: "Password must be at least 8 characters.",
  // })
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  // .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
});

export const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string(),
});
