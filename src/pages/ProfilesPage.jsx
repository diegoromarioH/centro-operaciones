import React from 'react';
import DataTable from '../components/DataTable';
import profiles from '../config/tables/profiles';

export default function ProfilesPage() {
  return <DataTable table={profiles} />;
}
