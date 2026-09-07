import React from 'react';
import DataTable from '../components/DataTable';
import automationLogs from '../config/tables/automationLogs';

export default function AutomationLogsPage() {
  return <DataTable table={automationLogs} />;
}
