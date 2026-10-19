import { injectable } from "tsyringe";
import {
    createCustomerAddress,
    deleteCustomerAddress,
    findCustomerAddressById,
    listUserCustomerAddresses,
    updateCustomerAddress
} from "../repository/customer-address.repo";
import { CustomerAddressNotFoundError } from "../errors";

@injectable()
export class CustomerAddressService {
    listUserCustomerAddresses: any = async (userId: number) => {
        const addresses = await listUserCustomerAddresses(userId);

        return addresses;
    }

    findCustomerAddressById: any = async (id: number) => {
        const address = await findCustomerAddressById(id);

        if (!address) {
            throw CustomerAddressNotFoundError;
        }

        return address;
    }

    createCustomerAddress: any = async (userId: number, addressData: any) => {
        const address = await createCustomerAddress(userId, addressData);

        return address;
    }

    updateCustomerAddress: any = async (id: number, userId: number, addressData: any) => {
        await updateCustomerAddress(id, userId, addressData);
    }

    deleteCustomerAddress: any = async (id: number, userId: number) => {
        await deleteCustomerAddress(id, userId);
    }
}