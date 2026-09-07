import React from 'react';
import DataTable from '../components/DataTable';
import benefits from '../config/tables/benefits';

export default function BenefitsPage() {
  return <DataTable table={benefits} />;
}
