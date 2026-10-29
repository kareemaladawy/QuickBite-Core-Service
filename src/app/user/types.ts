import { SystemRole } from "./enums";

export interface CreateUserData {
    name: string;
    email: string;
    phone: string;
    password: string;
    systemRole: SystemRole;
}
