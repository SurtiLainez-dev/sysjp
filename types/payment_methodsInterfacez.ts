import type {AccountInterfaz} from "@/types/transactionInterfacez";

export interface PaymentMethodInterfaz{
    name: string,
    is_cash: boolean,
    account?: AccountInterfaz
}
