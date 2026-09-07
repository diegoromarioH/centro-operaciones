import React from 'react';
import DataTable from '../components/DataTable';
import reservations from '../config/tables/reservations';

export default function ReservationsPage() {
  return <DataTable table={reservations} />;
}
