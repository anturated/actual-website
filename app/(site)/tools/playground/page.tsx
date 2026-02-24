import { Suspense } from "react";
import PlaygroundView from "./view";

export default function Playground() {
  return (
    <Suspense fallback={null}>
      <PlaygroundView />
    </Suspense>
  )
}

