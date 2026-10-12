import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { CustomerAddressController } from "./controller/customer-address.controller";

export const customerAddressRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(TOKENS.CustomerAddressController);

customerAddressRouter.get("/", authenticate, customerAddressController.listUserCustomerAddresses);
customerAddressRouter.post("/", authenticate, customerAddressController.createCustomerAddress);
customerAddressRouter.patch("/:id", authenticate, customerAddressController.updateCustomerAddress);
customerAddressRouter.delete("/:id", authenticate, customerAddressController.deleteCustomerAddress);