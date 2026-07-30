import { AttractionsTable } from '@/components/admin/AttractionsTable';

export default function AdminAttractionsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Manage attractions</h1>
      <p className="mt-1 text-muted-foreground">Create, edit, publish, and manage photos for every attraction.</p>
      <div className="mt-8">
        <AttractionsTable />
      </div>
    </div>
  );
}
