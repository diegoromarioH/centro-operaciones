import React from 'react';
import DataTable from '../components/DataTable';
import hosts from '../config/tables/hosts';

export default function HostsPage() {
  return <DataTable table={hosts} />;
}
