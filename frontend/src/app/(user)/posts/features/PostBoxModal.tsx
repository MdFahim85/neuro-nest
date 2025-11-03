"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../../components/ui/form";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { postBoxSchema } from "@/lib/zodSchema";
import { useCreatePost } from "@/hooks/postHooks";
import { useAuth } from "@/context/auth-client";
import toast from "react-hot-toast";
import z from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";

export default function PostBoxModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(postBoxSchema),
    defaultValues: {
      postTitle: "",
      postContent: "",
    },
  });

  const { mutate: createPost, isPending } = useCreatePost();

  const onSubmit = (data: z.infer<typeof postBoxSchema>) => {
    const title = data.postTitle;
    const content = data.postContent.split("#")[0];
    const hashTags = Array.from(
      data.postContent.matchAll(/#(\w+)/g),
      (m) => m[1]
    );

    createPost(
      {
        title,
        content,
        hashTags,
        authorId: user?.id as string,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          setOpen(false);
        },
        onError: (error) => toast.error(error?.message as string),
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="cursor-pointer">
          Create a post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col flex-1 gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="postTitle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <Label htmlFor="postTitle">Title</Label>
                      <Input
                        className="placeholder:text-neutral-500 resize-none bg-neutral-100"
                        placeholder="Write a post title."
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <Label htmlFor="postContent">Content</Label>
                      <Textarea
                        className="placeholder:text-neutral-500 min-h-[100px] resize-none bg-neutral-100"
                        placeholder="Write post details."
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="default"
                  type="button"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant={"secondary"}
                type="submit"
                disabled={isPending}
                className="bg-emerald-500 hover:bg-emerald-700"
              >
                {isPending ? "Posting" : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
