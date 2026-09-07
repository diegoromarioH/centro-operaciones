import React from 'react';
import DataTable from '../components/DataTable';
import boatOperators from '../config/tables/boatOperators';

export default function BoatOperatorsPage() {
  return <DataTable table={boatOperators} />;
}