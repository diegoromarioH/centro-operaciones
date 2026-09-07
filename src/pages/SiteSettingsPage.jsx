import React from 'react';
import DataTable from '../components/DataTable';
import siteSettings from '../config/tables/siteSettings';

export default function SiteSettingsPage() {
  return <DataTable table={siteSettings} />;
}
