import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-client";
import { useCommentOnPost } from "@/hooks/postHooks";
import { commentBoxSchema } from "@/lib/zodSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import z from "zod";

export default function CommentBox({
  postId,
  parentId,
}: {
  postId: string;
  parentId: string | null;
}) {
  const { user } = useAuth();
  const form = useForm({
    resolver: zodResolver(commentBoxSchema),
    defaultValues: {
      commentContent: "",
    },
  });

  const { mutate: comment, isPending: isCommenting } = useCommentOnPost();

  if (!user) {
    return null;
  }

  const onSubmit = (data: z.infer<typeof commentBoxSchema>) => {
    const content = data.commentContent;
    comment(
      { content, postId, parentId },
      {
        onSuccess: () => form.reset(),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  return (
    <div className="flex gap-4">
      <div className="sm:block hidden">
        <UserAvatar user={user} />
      </div>
      <div>
        <Form {...form}>
          <form
            className="flex sm:flex-row flex-col  justify-between gap-4 "
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="commentContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        className="placeholder:text-neutral-500 resize-none bg-neutral-100"
                        placeholder="Write a comment."
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button
              variant={"secondary"}
              type="submit"
              disabled={isCommenting}
              className="bg-emerald-500 hover:bg-emerald-700"
            >
              {isCommenting ? "Commenting" : "Comment"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
