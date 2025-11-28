import type {EmployeeInterfaz} from "@/employeeInterfaz";

export interface UserInterfaz{
    id?: number,
    username: string,
    password?: string,
    is_admin?: boolean,
    employee_id: number,
    pin_lookup: string,
    employe: EmployeeInterfaz
}
