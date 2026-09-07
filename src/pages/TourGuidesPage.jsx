import React from 'react';
import DataTable from '../components/DataTable';
import tourGuides from '../config/tables/tourGuides';

export default function TourGuidesPage() {
  return <DataTable table={tourGuides} />;
}