import { Router } from "express";
import { authenticate } from "../../lib/auth/middleware/guard";
import { requireRestaurantMember } from "../../lib/auth/middleware/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { MediaController } from "./controller/media.controller";

export const mediaRouter = Router();

const mediaController = container.resolve<MediaController>(TOKENS.MediaController);

mediaRouter.post(
    '/restaurants/:restaurantId/media',
    authenticate,
    requireRestaurantMember('restaurantId'),
    mediaController.requestRestaurantUpload
);

mediaRouter.post(
    '/users/me/media',
    authenticate,
    mediaController.requestProfileUpload
);

mediaRouter.get(
    '/media/:mediaId',
    authenticate,
    mediaController.findMediaById
);

mediaRouter.patch(
    '/media/:mediaId/complete',
    authenticate,
    mediaController.confirmUpload
);
