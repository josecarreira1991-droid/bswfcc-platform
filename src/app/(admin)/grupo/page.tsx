import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getChannels } from "@/lib/actions/group-chat";
import GroupChatView from "@/components/admin/GroupChatView";

export default async function GrupoPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  let channels: Awaited<ReturnType<typeof getChannels>> = [];

  try {
    channels = await getChannels().catch(() => []);
  } catch {
    // Tables might not exist yet
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Grupo</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Canais de conversa da c&acirc;mara
        </p>
      </div>

      <GroupChatView
        channels={channels}
        currentMemberId={member.id}
        currentMemberRole={member.role}
        currentMemberName={member.full_name}
        currentMemberCompany={member.company}
      />
    </div>
  );
}
