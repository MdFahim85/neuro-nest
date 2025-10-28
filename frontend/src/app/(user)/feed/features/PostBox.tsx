"use client";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-client";
import { useCreatePost } from "@/hooks/postHooks";
import { postBoxSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

function PostBox() {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(postBoxSchema),
    defaultValues: {
      postContent: "",
    },
  });

  const {
    mutate: createPost,
    isPending,
    isSuccess,
    isError,
    error,
  } = useCreatePost();
  useEffect(() => {
    if (isSuccess) {
      form.reset();
    }
    if (isError) {
      toast.error(error?.message as string);
    }
    console.log("repaint");
  }, [isSuccess, isError, error, form]);

  const onSubmit = (data: z.infer<typeof postBoxSchema>) => {
    createPost({
      title: data.postContent.split(" ")[0],
      content: data.postContent.slice(
        data.postContent.split(" ")[0].length + 1
      ),
      authorId: user?.id as string,
    });
    form.reset();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="w-full mt-4">
      <div className="flex gap-4">
        <UserAvatar user={user} />
        <Form {...form}>
          <form
            className="flex flex-col flex-1 gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="postContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="placeholder:text-gray-500 min-h-[100px] resize-none"
                      placeholder="What's on your mind?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <div className="flex justify-end items-center">
              <Button
                type="submit"
                disabled={!form.watch("postContent") || isPending}
              >
                Post
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default PostBox;
