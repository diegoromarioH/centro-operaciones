import React from 'react';
import DataTable from '../components/DataTable';
import ads from '../config/tables/ads';

export default function AdsPage() {
  return <DataTable table={ads} />;
}
