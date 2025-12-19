import ProfileView from "./view";

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const slug = (await params).username;
  if (!slug) return "WHERE USERNAME"

  const decoded = decodeURIComponent(slug);
  const username = decoded.replace("@", '');

  return <ProfileView username={username} />
}
