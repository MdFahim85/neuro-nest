import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEditPost } from "@/hooks/postHooks";
import { postBoxSchema } from "@/lib/zodSchema";
import { Post } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../../../components/ui/form";
import { Textarea } from "../../../../components/ui/textarea";
import { Input } from "../../../../components/ui/input";
import { useState } from "react";
import toast from "react-hot-toast";
import { Label } from "../../../../components/ui/label";

export function EditPostModal({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(postBoxSchema),
    defaultValues: {
      postTitle: post.title ? post.title : "",
      postContent: post.content ? post.content : "",
    },
  });

  const { mutate: editPost, isPending: isEditing } = useEditPost();

  const handleEditPost = (data: z.infer<typeof postBoxSchema>) => {
    const title = data.postTitle;
    const content = data.postContent.split("#")[0];
    const newHashTags = Array.from(
      data.postContent.matchAll(/#(\w+)/g),
      (m) => m[1]
    );

    editPost(
      {
        postId: post.id,
        title,
        content,
        hashTags: newHashTags.length ? newHashTags : post.hashtags,
      },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => toast.error(error?.message),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer hover:text-emerald-500 transition-colors"
        >
          <Pencil
            size={16}
            className="mr-2 cursor-pointer hover:text-emerald-500 transition-colors"
          />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col flex-1 gap-4"
            onSubmit={form.handleSubmit(handleEditPost)}
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
                        placeholder="Write a post title"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.stopPropagation();
                          }
                        }}
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
                        placeholder="What's on your mind?"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.stopPropagation();
                          }
                        }}
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
                  variant="outline"
                  type="button"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant={"secondary"}
                type="submit"
                disabled={isEditing}
                className="bg-emerald-500 hover:bg-emerald-700"
              >
                {isEditing ? "Saving" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
