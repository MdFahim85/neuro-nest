"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerFormSchema } from "@/lib/zodSchema";
import { useState } from "react";
import { Eye, EyeClosedIcon } from "lucide-react";
import z from "zod";
import { useRegisterUser } from "@/hooks/useRegister";

export function RegisterForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const form = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const {
    mutate: register,
    isPending,
    isSuccess,
    isError,
    error,
  } = useRegisterUser();

  const onSubmit = (data: z.infer<typeof registerFormSchema>) => {
    register({
      username: data.username,
      displayname: data.username,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-8 " onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  className="placeholder:text-white"
                  placeholder="Enter a unique username"
                  {...field}
                />
              </FormControl>

              <FormMessage className="text-white" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  className="placeholder:text-white"
                  placeholder="Enter your email address"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-white" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  className="placeholder:text-white"
                  type={showPass ? "text" : "password"}
                  placeholder="Create a strong password"
                  {...field}
                />
              </FormControl>
              <button
                type="button"
                className="absolute right-2 top-8"
                onClick={() => setShowPass((showPass) => !showPass)}
              >
                {showPass ? <Eye size={18} /> : <EyeClosedIcon size={18} />}
              </button>
              <FormMessage className="text-white" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="relative ">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type={showConfirm ? "text" : "password"}
                  className="placeholder:text-white"
                  placeholder="Re-enter your password"
                  {...field}
                />
              </FormControl>
              <button
                type="button"
                className="absolute right-2 top-8"
                onClick={() => setShowConfirm((showConfirm) => !showConfirm)}
              >
                {showConfirm ? <Eye size={18} /> : <EyeClosedIcon size={18} />}
              </button>
            </FormItem>
          )}
        />

        {isError && <p className="text-red-300">{error.message}</p>}

        <Button type="submit" variant={"secondary"} disabled={isPending}>
          Submit
        </Button>

        {isSuccess && (
          <p className="text-green-500">Registration successful!</p>
        )}
      </form>
    </Form>
  );
}
