import { SystemRole } from "../enums";

export class User {
    id: number;
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    systemRole: SystemRole;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    constructor(data: Partial<User>) {
        this.id = data.id!;
        this.name = data.name!;
        this.email = data.email!;
        this.phone = data.phone!;
        this.passwordHash = data.passwordHash!;
        this.systemRole = data.systemRole!;
        this.createdAt = data.createdAt!;
        this.updatedAt = data.updatedAt!;
        this.deletedAt = data.deletedAt ?? null;
    }

    isDeleted(): Boolean {
        return Boolean(this.deletedAt);
    }
}