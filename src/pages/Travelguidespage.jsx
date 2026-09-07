import React from 'react';
import DataTable from '../components/DataTable';
import travelGuides from '../config/tables/travelGuides';

export default function TravelGuidesPage() {
  return <DataTable table={travelGuides} />;
}