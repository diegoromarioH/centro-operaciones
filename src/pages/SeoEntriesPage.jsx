import React from 'react';
import DataTable from '../components/DataTable';
import seoEntries from '../config/tables/seoEntries';

export default function SeoEntriesPage() {
  return <DataTable table={seoEntries} />;
}
