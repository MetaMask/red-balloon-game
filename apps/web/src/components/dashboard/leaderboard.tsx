import { api } from "@/trpc/server";

export default async function Leaderboard() {
  const leaderboard = await api.admin.getLeaderboard();
  return (
    <>
      <h1 className="text-balance text-2xl font-bold text-secondary">
        Leaderboard
      </h1>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={user.username}>
            {index + 1}. {user.username} ({user.count}) - {user.totalCommission}
            %
          </li>
        ))}
      </ul>
    </>
  );
}
