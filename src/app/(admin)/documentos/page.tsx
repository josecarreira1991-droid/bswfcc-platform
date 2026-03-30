import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getDocuments } from "@/lib/actions/documents";
import DocumentCenter from "@/components/admin/DocumentCenter";

export default async function DocumentosPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const documents = await getDocuments().catch(() => []);
  return <DocumentCenter documents={documents} currentMember={member} />;
}
