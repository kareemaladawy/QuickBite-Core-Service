import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { requireInternalApiKey } from "../../lib/auth/middleware/api-key";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { CustomerAddressController } from "./controller/customer-address.controller";

export const customerAddressRouter = Router();

// mounted at root (not under /customer-addresses) so the internal path matches the
// documented cross-service contract: GET /api/internal/customer-addresses/:id
export const customerAddressInternalRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(TOKENS.CustomerAddressController);

customerAddressInternalRouter.get(
    "/internal/customer-addresses/:id",
    requireInternalApiKey,
    customerAddressController.findCustomerAddressInternal
);

customerAddressRouter.get("/", authenticate, customerAddressController.listUserCustomerAddresses);
customerAddressRouter.post("/", authenticate, customerAddressController.createCustomerAddress);
customerAddressRouter.patch("/:id", authenticate, customerAddressController.updateCustomerAddress);
customerAddressRouter.delete("/:id", authenticate, customerAddressController.deleteCustomerAddress);