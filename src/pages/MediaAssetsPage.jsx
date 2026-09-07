import React from 'react';
import DataTable from '../components/DataTable';
import mediaAssets from '../config/tables/mediaAssets';

export default function MediaAssetsPage() {
  return <DataTable table={mediaAssets} />;
}
