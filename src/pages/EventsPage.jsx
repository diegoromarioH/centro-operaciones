import React from 'react';
import DataTable from '../components/DataTable';
import events from '../config/tables/events';

export default function EventsPage() {
  return <DataTable table={events} />;
}
