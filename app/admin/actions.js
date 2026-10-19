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

export async function gantiPasswordAdmin(formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasiPassword = formData.get("konfirmasi_password");

  if (
    typeof passwordBaru !== "string" ||
    typeof konfirmasiPassword !== "string" ||
    passwordBaru.length < 8
  ) {
    redirect("/admin/password?error=length");
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect("/admin/password?error=mismatch");
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    redirect("/admin/password?error=configuration");
  }

  let supabase;
  try {
    supabase = await createSupabaseSessionClient();
  } catch (error) {
    console.error("Gagal membuat koneksi sesi Supabase untuk ganti password:", error);
    redirect("/admin/password?error=connection");
  }

  let user;
  let verificationError;
  try {
    const { data, error } = await supabase.auth.getUser();
    user = data.user;
    verificationError = error;
  } catch (error) {
    console.error("Gagal memverifikasi sesi admin untuk ganti password:", error);
    redirect("/admin/password?error=session");
  }

  if (verificationError) {
    console.error("Supabase Auth gagal memverifikasi sesi admin:", verificationError);
    redirect("/admin/password?error=session");
  }

  if (!user) {
    redirect("/admin/login");
  }

  let error;
  try {
    ({ error } = await supabase.auth.updateUser({ password: passwordBaru }));
  } catch (authError) {
    console.error("Gagal menghubungi Supabase Auth saat ganti password:", authError);
    redirect("/admin/password?error=update");
  }

  if (error) {
    console.error("Supabase Auth menolak perubahan password admin:", error);
    redirect("/admin/password?error=update");
  }

  redirect("/admin/password?status=success");
}
