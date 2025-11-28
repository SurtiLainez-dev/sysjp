import type {UserInterfaz} from "@/types/userInterfaz";

export interface CashierTransactionsInterfaz{
    id: number,
    cashier_id: number,
    user_id: number,
    type: 'ENTRY' | 'EXPENSE',
    amount: number,
    receipt_id?: number,
    payment_method_id: number,
    note?: string,
    created_at: string,
    user: UserInterfaz
}
