import React from 'react';
import DataTable from '../components/DataTable';
import homepageBanners from '../config/tables/homepageBanners';

export default function HomepageBannersPage() {
  return <DataTable table={homepageBanners} />;
}
