import {OficinaInterfaz} from "@/types/oficinaInterfaz";
import {PayrollInterfaz} from "@/types/employeeInterfaz";
import {BankAccountInterfaz} from "@/types/bankInterfaz";

export interface TransactionInterfaz{
    id: number,
    cod: string,
    ref_id?: number,
    date: Date,
    memo: string,
    source: SourcesTransactions,
    ref?:string,
    currency: 'USD',
    type: TxTypesTransactions,
    office_id: number,
    office: OficinaInterfaz,
    crated_at: Date,
    payrolls?: PayrollInterfaz,
}

export interface TransactionLineInterfaz{
    id: number,
    transaction_id: number,
    account_id: number,
    debit: number,
    credit: number,
    transaction?: TransactionInterfaz,
    account: AccountInterfaz
}

export interface AccountInterfaz{
    id: number,
    code: string,
    name: string,
    type: AccountType,
    parent_id: number,
    parent?:AccountInterfaz,
    children: AccountInterfaz[],
    is_cash: boolean,
    bank_account?: BankAccountInterfaz,
    transaction_lines: TransactionLineInterfaz[]
}
export interface TaxInterfaz{
    id?: number,
    name: string,
    rate: number,
    account?: AccountInterfaz
}
enum AccountType{
    ASSET = 'ASSET',
    LIABILITY = 'LIABILITY',
    EQUITY = 'EQUITY',
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}
enum SourcesTransactions{
    SALES = 'SALES',
    PAYROLL = 'PAYROLL',
    PURCHASE = 'PURCHASE',
    MANUAL = 'MANUAL',
    CARD = 'CARD'
}

enum TxTypesTransactions{
    MANUAL = 'MANUAL',
    PURCHASE = 'PURCHASE',
    PAYROLL = 'PAYROLL',
    SALES = 'SALES',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER'
}
