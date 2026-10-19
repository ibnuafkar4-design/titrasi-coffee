import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { masukAdmin } from "@/app/admin/actions";

const pesanError = {
  fields: "Masukkan email dan password.",
  configuration: "Konfigurasi Supabase belum lengkap. Hubungi pengelola aplikasi.",
  connection: "Tidak dapat terhubung ke layanan login. Periksa koneksi lalu coba lagi.",
  credentials: "Email atau password salah. Periksa kembali lalu coba lagi.",
};

export default async function HalamanLogin({ searchParams }) {
  const { error } = await searchParams;
  const pesan =
    typeof error === "string" && Object.hasOwn(pesanError, error)
      ? pesanError[error]
      : null;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Masuk admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">Khusus pemilik toko untuk mengelola produk.</p>
      </div>
      <form action={masukAdmin} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Tombol type="submit">Masuk</Tombol>
      </form>
      {pesan ? (
        <p role="alert" className="text-sm text-bahaya">
          {pesan}
        </p>
      ) : null}
    </div>
  );
}
