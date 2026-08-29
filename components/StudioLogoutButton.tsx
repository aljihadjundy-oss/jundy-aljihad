"use client";

import { useRouter } from "next/navigation";

export default function StudioLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/studio/logout", { method: "POST" });
    router.push("/studio/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      data-cursor-hover
      className="text-sm text-muted hover:text-white"
    >
      Keluar
    </button>
  );
}
