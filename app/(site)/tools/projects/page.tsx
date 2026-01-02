"use client"

import { CustomButton } from "@/components/CustomButton";
import { UserDTO } from "@/data/user-dto";
import { meFetcher, projectsFetcher } from "@/lib/fetchers";
import { Project } from "@prisma/client";
import Link from "next/link";
import { FormEvent, useRef } from "react";
import useSWR from "swr";

export default function Projects() {
  const { data: userData } = useSWR("/api/me", meFetcher);
  const { data: projectsData, mutate } = useSWR("/api/projects", projectsFetcher);

  const titleRef = useRef<HTMLInputElement | null>(null);

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    if (!projectsData?.projects || !userData?.user) return;
    const projects = projectsData.projects;

    const title = titleRef.current?.value;
    if (!title) return;

    const newProject: Project = {
      id: "",
      title,
      slug: "",
      projectBGId: null,
      ownerId: userData.user.id
    }

    mutate({ projects: [newProject, ...projects] }, false);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (res.ok) target.reset();
    mutate()
  }

  return (<>
    {userData &&
      <form onSubmit={onCreate}>
        <input
          placeholder="Project title"
          ref={titleRef}
        />
        <CustomButton>
          Create
        </CustomButton>
      </form>
    }

    <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-[8px]">
      {projectsData?.projects && projectsData.projects.map(p =>
        <ProjectCard
          project={p}
          userData={userData?.user}
          key={p.id}
        />
      )}
    </div>
  </>)
}

function ProjectCard({
  project,
  userData,
}: {

  project: Project,
  userData?: UserDTO,
}) {
  const isOwner = userData?.id === project.ownerId;

  return (
    <Link
      className="flex flex-col gap-2 relative outline-2 outline-outline rounded-lg min-h-24 p-2"
      href={`/tools/projects/${project.slug}`}
    >
      <p >
        {project.title}
      </p>
    </Link>
  )
}
