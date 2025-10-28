"use client";
import UserAvatar from "@/components/shared/UserAvatar";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-client";
import { postBoxSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

function PostBox() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const form = useForm({
    resolver: zodResolver(postBoxSchema),
    defaultValues: {
      postContent: "",
    },
  });

  return (
    <div className="w-full">
      <div className="flex gap-4">
        <UserAvatar user={user} />
        <Form {...form}>
          <form
            className="space-y-8  flex gap-2"
            onSubmit={form.handleSubmit((data) => console.log(data))}
          >
            <FormField
              control={form.control}
              name="postContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="placeholder:text-gray-500"
                      placeholder="Whats on your mind ?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-white" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}

export default PostBox;
