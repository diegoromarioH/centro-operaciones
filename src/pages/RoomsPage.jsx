import React from 'react';
import DataTable from '../components/DataTable';
import rooms from '../config/tables/rooms';

export default function RoomsPage() {
  return <DataTable table={rooms} />;
}
