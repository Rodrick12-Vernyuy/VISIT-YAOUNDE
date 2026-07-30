'use client';

import { LayoutGrid, ListFilter, Map as MapIcon, Search } from 'lucide-react';
import { useCategories } from '@/lib/queries/categories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DISTRICTS = ['Centre-ville', 'Bastos', 'Mvog-Betsi', 'Fébé', 'Elig-Essono', 'Ngoa-Ekelle'];

export interface AttractionFiltersState {
  q: string;
  category: string;
  district: string;
  sort: 'newest' | 'name';
}

interface AttractionFiltersProps {
  value: AttractionFiltersState;
  onChange: (value: AttractionFiltersState) => void;
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

const ANY = 'any';

export function AttractionFilters({ value, onChange, view, onViewChange }: AttractionFiltersProps) {
  const { data: categories } = useCategories();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={value.q}
          onChange={(event) => onChange({ ...value, q: event.target.value })}
          placeholder="Search attractions…"
          className="border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={value.category || ANY}
          onValueChange={(next) => onChange({ ...value, category: next === ANY ? '' : next })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.district || ANY}
          onValueChange={(next) => onChange({ ...value, district: next === ANY ? '' : next })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All districts</SelectItem>
            {DISTRICTS.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.sort} onValueChange={(next) => onChange({ ...value, sort: next as 'newest' | 'name' })}>
          <SelectTrigger className="w-36">
            <ListFilter className="mr-1 h-4 w-4" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex overflow-hidden rounded-lg border border-border">
          <Button
            type="button"
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-none"
            aria-label="List view"
            onClick={() => onViewChange('list')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={view === 'map' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-none"
            aria-label="Map view"
            onClick={() => onViewChange('map')}
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
