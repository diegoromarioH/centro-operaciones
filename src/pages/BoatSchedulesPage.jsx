import React from 'react';
import DataTable from '../components/DataTable';
import boatSchedules from '../config/tables/boatSchedules';

export default function BoatSchedulesPage() {
  return <DataTable table={boatSchedules} />;
}
