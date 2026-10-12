import { injectable } from "tsyringe";
import {
    createCustomerAddress,
    deleteCustomerAddress,
    listUserCustomerAddresses,
    updateCustomerAddress
} from "../repository/customer-address.repo";

@injectable()
export class CustomerAddressService {
    listUserCustomerAddresses: any = async (userId: number) => {
        const addresses = await listUserCustomerAddresses(userId);

        return addresses;
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