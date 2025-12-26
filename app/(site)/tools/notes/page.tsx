import { Suspense } from "react";
import NotesView from "./view";

export default function NotesPage() {
  return (
    <Suspense fallback={null}>
      <NotesView />
    </Suspense>
  )
}
