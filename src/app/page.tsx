import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0a0a]">
      <a className="text-white text-xl underline" href="/auth">Enter the Vault</a>
    </div>
  );
}
