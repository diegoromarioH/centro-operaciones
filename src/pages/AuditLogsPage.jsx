import React from 'react';
import DataTable from '../components/DataTable';
import auditLogs from '../config/tables/auditLogs';

export default function AuditLogsPage() {
  return <DataTable table={auditLogs} />;
}
