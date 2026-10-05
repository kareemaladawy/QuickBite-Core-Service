import { db } from "../../../common/knex/knex";
import { CustomerAddress } from "../entity/customer-address.entity";
import { CustomerAddressNotFoundError } from "../errors";

const customerAddressColumns = [
    "id",
    "user_id",
    "label",
    "country",
    "city",
    "street",
    "building",
    "apartment_number",
    "lat",
    "long",
    "type",
    "is_default",
    "created_at",
];

function toEntity(row: any): CustomerAddress {
    return new CustomerAddress({
        id: row.id,
        userId: row.user_id,
        label: row.label,
        country: row.country,
        city: row.city,
        street: row.street,
        building: row.building,
        apartmentNumber: row.apartment_number,
        lat: row.lat,
        long: row.long,
        type: row.type,
        isDefault: row.is_default,
        createdAt: row.created_at,
    });
}

export async function listUserCustomerAddresses(userId: number): Promise<CustomerAddress[]> {
    const addresses = await db("customer_addresses")
        .where("user_id", userId)
        .select(customerAddressColumns);

    return addresses.map(toEntity);
}

export async function createCustomerAddress(userId: number, data: any): Promise<CustomerAddress> {
    const [address] = await db("customer_addresses").insert({
        user_id: userId,
        label: data.label,
        country: data.country,
        city: data.city,
        street: data.street,
        building: data.building,
        apartment_number: data.apartmentNumber,
        lat: data.lat,
        long: data.long,
        type: data.type,
        is_default: data.isDefault,
        created_at: new Date(),
    }).returning(customerAddressColumns);

    return toEntity(address);
}

export async function updateCustomerAddress(id: number, userId: number, data: any): Promise<CustomerAddress> {
    const [address] = await db("customer_addresses").where({ id, user_id: userId }).update({
        label: data.label,
        country: data.country,
        city: data.city,
        street: data.street,
        building: data.building,
        apartment_number: data.apartmentNumber,
        lat: data.lat,
        long: data.long,
        type: data.type,
        is_default: data.isDefault,
    }).returning(customerAddressColumns);

    if (!address) {
        throw CustomerAddressNotFoundError;
    }

    return toEntity(address);
}

export async function deleteCustomerAddress(id: number, userId: number): Promise<void> {
    const deletedCount = await db("customer_addresses").where({ id, user_id: userId }).del();

    if (deletedCount === 0) {
        throw CustomerAddressNotFoundError;
    }
}
