import { ProjectFull, projectWithEverything } from "@/app/api/projects/[projectId]/route";
import { prisma } from "./prisma";

export async function getProjectBySlug(slug: string): Promise<ProjectFull | null> {
  return await prisma.project.findUnique({
    where: { slug },
    ...projectWithEverything,
  })
}
