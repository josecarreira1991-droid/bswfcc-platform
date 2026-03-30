import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getMyConversations } from "@/lib/actions/chat";
import DirectChatView from "@/components/admin/DirectChatView";

export default async function ChatPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  let conversations: Awaited<ReturnType<typeof getMyConversations>> = [];

  try {
    conversations = await getMyConversations().catch(() => []);
  } catch {
    // Tables might not exist yet
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Chat</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Mensagens diretas entre membros da c&acirc;mara
        </p>
      </div>

      <DirectChatView conversations={conversations} currentMemberId={member.id} />
    </div>
  );
}
