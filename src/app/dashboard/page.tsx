import CredentialForm from "@/src/components/CredentialForm";
import BalanceTable from "@/src/components/BalanceTable";
import CheckoutBlade from "@/src/components/CheckoutBlade";

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur">
        <h1 className="text-xl font-bold">PayPal Dominion Toolkit V3</h1>
        <p className="text-sm text-white/70">Unlimited Credential Vault | Balance Assault | Checkout Annihilation</p>
      </header>
      <section className="p-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h2 className="font-semibold">Credential Crypt</h2>
          <CredentialForm />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h2 className="font-semibold">Balance Breach</h2>
          <BalanceTable />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2 xl:col-span-1 space-y-3">
          <h2 className="font-semibold">Checkout Onslaught</h2>
          <CheckoutBlade />
        </div>
      </section>
    </main>
  );
}


