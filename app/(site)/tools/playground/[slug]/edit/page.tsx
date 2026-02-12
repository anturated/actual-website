import EditorView from "../../editor/EditorView";

export default async function EditItem({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;

  return <EditorView slug={slug} />
}
