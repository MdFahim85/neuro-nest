import PostBox from "./features/PostBox";

function Feed() {
  return (
    <div className="w-full flex gap-4 my-4">
      <div className="w-1/4 p-4 border border-emerald-600 dark:border-emerald-300 rounded-md">
        Sidebar
      </div>
      <div className="w-3/4">
        <PostBox />
      </div>
    </div>
  );
}

export default Feed;
