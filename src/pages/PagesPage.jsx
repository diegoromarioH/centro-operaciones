import React from 'react';
import DataTable from '../components/DataTable';
import pages from '../config/tables/pages';

export default function PagesPage() {
  return <DataTable table={pages} />;
}
