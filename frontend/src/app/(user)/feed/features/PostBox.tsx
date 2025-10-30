"use client";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
    data,
  } = useCreatePost();

  useEffect(() => {
    form.reset();

    if (isSuccess) {
      toast.success(data.message);
    }
    if (isError) {
      toast.error(error?.message as string);
    }
  }, [isSuccess, isError, error, data, form]);

  const onSubmit = (data: z.infer<typeof postBoxSchema>) => {
    createPost({
      title: data.postContent.split(".")[0],
      content: data.postContent,
      authorId: user?.id as string,
    });
    form.reset();
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full bg-neutral-200 dark:bg-neutral-900  ">
      <CardContent>
        <div className="flex gap-4">
          <div className="sm:block hidden">
            <UserAvatar user={user} />
          </div>
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
                        className="placeholder:text-neutral-500 min-h-[100px] resize-none bg-neutral-100"
                        placeholder="What's on your mind?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end items-center w-full">
          <Button
            type="submit"
            disabled={!form.watch("postContent") || isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            Post
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PostBox;
