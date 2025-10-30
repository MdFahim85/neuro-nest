import PostBox from "./features/PostBox";
import PostList from "./features/PostList";

function Feed() {
  return (
    <div className="w-full grid grid-cols-12 gap-4 my-4">
      <div className="max-h-1/3 md:col-span-4 col-span-12 p-4 border border-emerald-600 dark:border-emerald-300 rounded-md sticky top-22">
        <div>sidebar</div>
      </div>
      <div className="md:col-span-8 col-span-12 space-y-4">
        <PostBox />
        <PostList />
      </div>
    </div>
  );
}

export default Feed;
