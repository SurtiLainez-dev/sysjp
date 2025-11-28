import type {BrandsInterfaz} from "@/types/supplierInterfaz";
import {TaxInterfaz} from "@/types/transactionInterfacez";

export interface CategoryInterfaz{
    id?: number,
    name: string,
    description: string,
    code: string,
    parent_id?: number,
    parent?: CategoryInterfaz,
    children?: CategoryInterfaz[]
}

export interface ArticleInterfaz{
    id?: number,
    brand_id: number,
    category_id: number,
    name: string,
    description: string,
    model_code?: string,
    sku: string,
    bar_code: string,
    cost_price: number,
    sale_price: number,
    photo?: string,
    is_cc: boolean,
    brand: BrandsInterfaz,
    category: CategoryInterfaz,
    history: ArticleHistoryInterfaz,
    taxes: [
        [
            id: number,
            is_active: boolean,
            tax: TaxInterfaz
        ]
    ]
}

export interface ArticleHistoryInterfaz{
    id?: number,
    article_id: number,
    description: string,
    article: ArticleInterfaz
}
