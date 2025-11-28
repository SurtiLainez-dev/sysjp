import type {CustomerInterfaz} from "@/types/customerInterfacez";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import type {UserInterfaz} from "@/types/userInterfaces";
import {ArticleInterfaz} from "@/types/inventoryinterfaces";
export type WorkOrderStatus = 'OPEN' | 'CERRADA'
export interface WorkOrderInterfaz {
    id?: number
    customer_id: number
    office_id: number
    user_id: number
    job_detail: string
    employee_notes?: string | null
    subtotal: number
    discount: number
    total: number
    created_at: string | Date
    updated_at: string | Date
    status: WorkOrderStatus

    customer?: CustomerInterfaz
    office?: OficinaInterfaz
    user?: UserInterfaz
    items?: WorkOrderItemInterfaz[]
}

export interface WorkOrderItemInterfaz {
    id: number
    work_order_id: number
    article_id: number
    quantity: number
    price: number
    total: number
    note?: string | null
    created_at: string | Date
    updated_at: string | Date
    article?: ArticleInterfaz
}

