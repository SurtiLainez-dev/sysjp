import type {AccountInterfaz} from "@/types/transactionInterfacez";

export interface BankInterfaz {
    id: number,
    name: string
}

export interface BankAccountInterfaz{
    id: number,
    num: string,
    nickname: string,
    bank_id: number,
    is_checking: boolean,
    account_id: number,
    account?: AccountInterfaz,
    bank?: BankInterfaz
}
