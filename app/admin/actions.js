"use server";

import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "@/lib/supabase/session";

export async function masukAdmin(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    redirect("/admin/login?error=fields");
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    redirect("/admin/login?error=configuration");
  }

  const supabase = await createSupabaseSessionClient();
  let error;

  try {
    ({ error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    }));
  } catch (authError) {
    console.error("Gagal menghubungi Supabase Auth saat login:", authError);
    redirect("/admin/login?error=connection");
  }

  if (error) {
    console.error("Login admin ditolak oleh Supabase Auth:", error);
    redirect("/admin/login?error=credentials");
  }

  redirect("/admin");
}

export async function keluarAdmin() {
  const supabase = await createSupabaseSessionClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Gagal mengakhiri sesi admin:", error);
    throw new Error("Gagal mengakhiri sesi. Silakan coba keluar lagi.");
  }

  redirect("/admin/login");
}
