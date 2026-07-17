import { notFound } from "next/navigation";
import dbConnect from "../../../../lib/db";
import App from "../../../../models/App";
import AdminShell from "../../../../components/AdminShell";
import AppForm from "../../../../components/AppForm";
import { updateApp } from "../../actions";

export default async function EditAppPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error;

  await dbConnect();
  const app = await App.findById(id).lean();
  if (!app) notFound();

  const updateAppWithId = updateApp.bind(null, id);

  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-slate-900">Update {app.name}</h1>
      <div className="mt-4">
        <AppForm
          action={updateAppWithId}
          initialData={JSON.parse(JSON.stringify(app))}
          errorMessage={errorMessage}
        />
      </div>
    </AdminShell>
  );
}
