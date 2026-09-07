import React from 'react';
import DataTable from '../components/DataTable';
import landTransportSchedules from '../config/tables/landTransportSchedules';

export default function LandTransportSchedulesPage() {
  return <DataTable table={landTransportSchedules} />;
}
