import { NextFunction, Request, Response } from "express";
import { CustomerAddressService } from "../service/customer-address.service";
import { createCustomerAddress } from "../repository/customer-address.repo";
import { validateBody } from "../../../common/validation/validate";
import { CreateCustomerAddressDto, UpdateCustomerAddressDto } from "../dto/customer-address.dto";

export class CustomerAddressController {
    constructor(private readonly customerAddressService: CustomerAddressService) { }

    listUserCustomerAddresses: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const addresses = await this.customerAddressService.listUserCustomerAddresses(req.user?.userId);

            return res.status(200).json({
                data: addresses
            });
        } catch (error) {
            next(error);
        }
    }

    createCustomerAddress: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(CreateCustomerAddressDto, req.body);
            const address = await this.customerAddressService.createCustomerAddress(req.user?.userId, validated);

            return res.status(201).json({
                data: address
            });
        } catch (error) {
            next(error);
        }
    }

    updateCustomerAddress: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(UpdateCustomerAddressDto, req.body);
            const address = await this.customerAddressService.updateCustomerAddress(req.params.id, req.user?.userId, validated);

            return res.status(200).json({
                data: address
            });
        } catch (error) {
            next(error);
        }
    }

    deleteCustomerAddress: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.customerAddressService.deleteCustomerAddress(req.params.id, req.user?.userId);

            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export const customerAddressController = new CustomerAddressController(new CustomerAddressService());