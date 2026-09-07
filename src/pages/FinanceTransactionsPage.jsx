import React from 'react';
import DataTable from '../components/DataTable';
import financeTransactions from '../config/tables/financeTransactions';

export default function FinanceTransactionsPage() {
  return <DataTable table={financeTransactions} />;
}
