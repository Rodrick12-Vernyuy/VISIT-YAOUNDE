import { AttractionForm } from '@/components/admin/AttractionForm';

export default function NewAttractionPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Add attraction</h1>
      <p className="mt-1 text-muted-foreground">
        Fill in the details below. You&apos;ll be able to upload photos right after creating it.
      </p>
      <div className="mt-8 max-w-3xl">
        <AttractionForm mode="create" />
      </div>
    </div>
  );
}
