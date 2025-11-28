export interface SupplierInterfaz{
    id: number,
    fullname: string,
    name: string,
    email?: string,
    phone?: string,
    address: string
}

export interface BrandsInterfaz{
    id?: number,
    name: string,
    suppliers?: SupplierBrandsInterfaz[]
}

export interface SupplierBrandsInterfaz{
    brand_id: number,
    supplier_id?: number,
    name?: string
}
