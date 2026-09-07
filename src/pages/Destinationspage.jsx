import React from 'react';
import DataTable from '../components/DataTable';
import destinations from '../config/tables/destinations';

export default function DestinationsPage() {
  return <DataTable table={destinations} />;
}