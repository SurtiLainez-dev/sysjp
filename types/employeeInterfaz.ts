import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import type {BankAccountInterfaz} from "@/types/bankInterfaz";
import type {TransactionInterfaz} from "@/types/transactionInterfacez";

export interface EmployeeInterfaz{
    id?: number,
    name: string,
    office?: OficinaInterfaz,
    office_id: number,
    phone: string,
    typeEmployee?: TypeEmployeeInterfaz,
    typeEmployee_id: number,
}

export interface TypeEmployeeInterfaz{
    id: number,
    name: string
}
export interface TypePayrollInterfaz{
    id: number,
    name: string,
    effect: 'ADD' | 'SUBTRACT',
    default_debit_account_id?: number,
    default_credit_account_id?: number
}

export interface PayrollItemInterfaz{
    id?:number,
    payroll_id?:number,
    type_payroll_id: number
    description: string,
    amount: number,
    effect?: string,
    account?: number,
    type?: 'CREDIT' | 'DEBIT'
}
export interface PayrollInterfaz{
    id: number,
    employee_id: number,
    year: number,
    month: number,
    start_period: number,
    end_period: number,
    gross_total: number,
    deductions_total: number,
    net_total: number,
    banck_account_id?: number,
    type_pay: TypePay,
    office_id: number,
    transaction_id: number,
    notes: string,
    office?: OficinaInterfaz,
    bank_account?: BankAccountInterfaz,
    employee?: EmployeeInterfaz,
    items?: PayrollItemInterfaz[],
    transaction: TransactionInterfaz
}

export enum TypePay {
    CASH='CASH',
    CARD='CARD',
    CHECK='CHECK',
    ZELLE='ZELLE',
    TRANSFER='TRANSFER'
}
