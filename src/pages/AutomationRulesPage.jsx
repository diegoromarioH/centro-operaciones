import React from 'react';
import DataTable from '../components/DataTable';
import automationRules from '../config/tables/automationRules';

export default function AutomationRulesPage() {
  return <DataTable table={automationRules} />;
}
