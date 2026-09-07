import React from 'react';
import DataTable from '../components/DataTable';
import landTransportRoutes from '../config/tables/landTransportRoutes';

export default function LandTransportRoutesPage() {
  return <DataTable table={landTransportRoutes} />;
}
