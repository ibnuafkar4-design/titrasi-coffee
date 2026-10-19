import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Konfigurasi Supabase sesi belum lengkap. Pastikan SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY sudah diatur.",
    );
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

    let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError") {
      console.error("Supabase Auth gagal memverifikasi sesi untuk rute admin:", error);
      throw new Error("Sesi admin tidak dapat diverifikasi. Silakan coba lagi.");
    }
    user = data?.user ?? null;
  } catch (authError) {
    console.error("Gagal memverifikasi sesi Supabase untuk rute admin:", authError);
    throw new Error("Sesi admin tidak dapat diverifikasi. Silakan coba lagi.");
  }

  if (!user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
