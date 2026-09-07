import React from 'react';
import DataTable from '../components/DataTable';
import accommodationHosts from '../config/tables/accommodationHosts';

export default function AccommodationHostsPage() {
  return <DataTable table={accommodationHosts} />;
}
