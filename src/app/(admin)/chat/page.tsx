import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getMyConversations } from "@/lib/actions/chat";
import DirectChatView from "@/components/admin/DirectChatView";

export default async function ChatPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const conversations = await getMyConversations().catch(() => []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-corp-text">Chat</h1>
        <p className="text-sm text-corp-muted mt-0.5">
          Mensagens diretas entre membros da c&acirc;mara
        </p>
      </div>

      <DirectChatView conversations={conversations} currentMemberId={member.id} />
    </div>
  );
}
