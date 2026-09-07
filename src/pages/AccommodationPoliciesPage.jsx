import React from 'react';
import DataTable from '../components/DataTable';
import accommodationPolicies from '../config/tables/accommodationPolicies';

export default function AccommodationPoliciesPage() {
  return <DataTable table={accommodationPolicies} />;
}
