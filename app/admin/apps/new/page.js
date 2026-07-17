import AdminShell from "../../../../components/AdminShell";
import AppForm from "../../../../components/AppForm";
import { createApp } from "../../actions";

export default async function NewAppPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error;

  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-slate-900">Add App</h1>
      <div className="mt-4">
        <AppForm action={createApp} errorMessage={errorMessage} />
      </div>
    </AdminShell>
  );
}
