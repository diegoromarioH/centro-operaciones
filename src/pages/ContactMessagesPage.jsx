import React from 'react';
import DataTable from '../components/DataTable';
import contactMessages from '../config/tables/contactMessages';

export default function ContactMessagesPage() {
  return <DataTable table={contactMessages} />;
}
