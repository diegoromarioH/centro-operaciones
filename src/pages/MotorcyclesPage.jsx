import React from 'react';
import DataTable from '../components/DataTable';
import motorcycles from '../config/tables/motorcycles';

export default function MotorcyclesPage() {
  return <DataTable table={motorcycles} />;
}
