"use server"
import { getProjectBySlug } from "@/lib/projects";
import { notFound } from "next/navigation";
import ProjectView from "./view";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (!slug) notFound();

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectView defaultProject={project} />
}
