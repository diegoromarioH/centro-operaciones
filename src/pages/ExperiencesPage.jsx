import React from 'react';
import DataTable from '../components/DataTable';
import experiences from '../config/tables/experiences';

export default function ExperiencesPage() {
  return <DataTable table={experiences} />;
}
