"use client";

import logout from "@/app/actions/logout";


export default function Dashboard() {

  return <button
    onClick={logout}
  >
    logout
  </button>
}
