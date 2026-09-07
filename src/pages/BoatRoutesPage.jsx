import React from 'react';
import DataTable from '../components/DataTable';
import boatRoutes from '../config/tables/boatRoutes';

export default function BoatRoutesPage() {
  return <DataTable table={boatRoutes} />;
}
