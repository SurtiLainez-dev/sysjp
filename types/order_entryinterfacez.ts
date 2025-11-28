import type {SupplierInterfaz} from "@/types/supplierInterfaz";
import type {OficinaInterfaz} from "@/types/oficinaInterfaz";
import type {ArticleInterfaz} from "@/types/inventoryinterfaces";
export interface EntryOrderInterfaz{
    id?: number,
    code: string,
    supplier_id: SupplierInterfaz,
    branch_id: OficinaInterfaz,
    date: Date,
    total_amount: number,
    disccount: number,
    notes?: string,
    is_envoiced: boolean,
    is_posted: boolean,
    entry_order_details: EntryOrderDetailsInterfaz[]
}

export interface EntryOrderDetailsInterfaz{
    id?: number,
    entry_order_id: number,
    article_id: number,
    quantity: number,
    unit_cost: number,
    subtotal: number
    article: ArticleInterfaz
}

export interface ArticleStockInterfaz{
    id: number,
    branch_id: number,
    article_id: number,
    stock: number,
    branch: OficinaInterfaz,
    article: ArticleInterfaz
}
