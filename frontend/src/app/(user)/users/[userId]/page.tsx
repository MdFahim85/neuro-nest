import UserDetailsFetch from "./features/UserDetailsFetch";

export default async function User({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <div>
      <UserDetailsFetch userId={userId} />
    </div>
  );
}
