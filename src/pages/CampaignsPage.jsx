import React from 'react';
import DataTable from '../components/DataTable';
import campaigns from '../config/tables/campaigns';

export default function CampaignsPage() {
  return <DataTable table={campaigns} />;
}
