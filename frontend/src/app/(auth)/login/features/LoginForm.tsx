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
import { loginFormSchema } from "@/lib/zodSchema";
import { useState } from "react";
import { Eye, EyeClosedIcon } from "lucide-react";
import z from "zod";
import { useLoginUser } from "@/hooks/authHooks";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const [showPass, setShowPass] = useState(false);
  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    mutate: login,
    isPending,
    isSuccess,
    isError,
    error,
  } = useLoginUser();
  const onSubmit = (data: z.infer<typeof loginFormSchema>) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/posts";

  if (isSuccess) {
    window.location.assign(redirectTo);
  }

  return (
    <Form {...form}>
      <form className="space-y-8 " onSubmit={form.handleSubmit(onSubmit)}>
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
                  placeholder="Enter your password"
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

        {isError && <p className="text-red-300 my-4">{error.message}</p>}

        <Button type="submit" variant={"secondary"} disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
