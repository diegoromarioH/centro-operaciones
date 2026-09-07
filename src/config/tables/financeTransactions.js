import { DollarSign } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const financeTransactions = {
  key: "finance_transactions",
  label: "Transacciones",
  icon: DollarSign,
  group: "Finanzas y automatización",
  path: "/finanzas/transactions",
  orderBy: "transaction_date",
  ascending: false,
  list: ["transaction_type", "concept", "amount", "status", "transaction_date"],
  columns: [
    { key: "transaction_type", label: "Tipo", type: FIELD.SELECT, required: true, options: ["income", "expense", "commission", "potential_commission"] },
    { key: "concept", label: "Concepto", type: FIELD.TEXT, required: true },
    { key: "target_type", label: "Tipo de objetivo", type: FIELD.TEXT },
    { key: "target_id", label: "ID del objetivo", type: FIELD.TEXT },
    { key: "amount", label: "Monto", type: FIELD.NUMBER, required: true },
    { key: "currency", label: "Moneda", type: FIELD.TEXT },
    { key: "status", label: "Estado", type: FIELD.SELECT, options: ["pending", "confirmed", "cancelled"] },
    { key: "transaction_date", label: "Fecha", type: FIELD.DATE },
    { key: "notes", label: "Notas", type: FIELD.TEXTAREA },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default financeTransactions;
