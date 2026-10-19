import { NextFunction, Request, Response } from "express";
import { CustomerAddressService } from "../service/customer-address.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateCustomerAddressDto, UpdateCustomerAddressDto } from "../dto/customer-address.dto";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendCreated, sendNoContent, sendSuccess } from "../../../lib/http/response";

@injectable()
export class CustomerAddressController {
    constructor(
        @inject(TOKENS.CustomerAddressService) private readonly customerAddressService: CustomerAddressService
    ) { }

    listUserCustomerAddresses: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const addresses = await this.customerAddressService.listUserCustomerAddresses(req.user?.userId);

            sendSuccess(res, addresses);
        } catch (error) {
            next(error);
        }
    }

    findCustomerAddressInternal: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const address = await this.customerAddressService.findCustomerAddressById(Number(req.params.id));
            const addressText = [address.street, address.building, address.apartmentNumber]
                .filter(Boolean)
                .join(", ") || `${address.city}, ${address.country}`;

            sendSuccess(res, {
                id: address.id,
                userId: address.userId,
                lat: address.lat,
                lng: address.long,
                addressText,
                city: address.city,
                country: address.country,
                building: address.building,
                apartmentNumber: address.apartmentNumber,
                label: address.label,
            });
        } catch (error) {
            next(error);
        }
    }

    createCustomerAddress: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(CreateCustomerAddressDto, req.body);
            const address = await this.customerAddressService.createCustomerAddress(req.user?.userId, validated);

            sendCreated(res, address);
        } catch (error) {
            next(error);
        }
    }

    updateCustomerAddress: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await validateBody(UpdateCustomerAddressDto, req.body);
            await this.customerAddressService.updateCustomerAddress(req.params.id, req.user?.userId, validated);

            sendSuccess(res, { message: "Address updated" });
        } catch (error) {
            next(error);
        }
    }

    deleteCustomerAddress: any = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.customerAddressService.deleteCustomerAddress(req.params.id, req.user?.userId);

            sendNoContent(res);
        } catch (error) {
            next(error);
        }
    }
}