import { container } from 'tsyringe';
import { TOKENS } from './tokens';
import { Logger } from '../logger/logger';
import { AuthService } from '../../app/auth/service/auth.service';
import { UserService } from '../../app/user/service/user.service';
import { BranchService } from '../../app/branch/service/branch.service';
import { RestaurantService } from '../../app/restaurant/service/restaurant.service';
import { RestaurantMemberService } from '../../app/rbac/service/restaurant-member.service';
import { ProductService } from '../../app/product/service/product.service';
import { CustomerAddressService } from '../../app/customer-address/service/customer-address.service';
import { PermissionCacheService } from '../../app/rbac/service/permission-cache.service';
import { MemberBranchCacheService } from '../../app/rbac/service/member-branch-cache.service';
import { AuthController } from '../../app/auth/controller/auth.controller';
import { BranchController } from '../../app/branch/controller/branch.controller';
import { CustomerAddressController } from '../../app/customer-address/controller/customer-address.controller';
import { ProductController } from '../../app/product/controller/product.controller';
import { RestaurantMemberController } from '../../app/rbac/controller/restaurant-member.controller';
import { RestaurantController } from '../../app/restaurant/controller/restaurant.controller';
import { UserController } from '../../app/user/controller/user.controller';
import { cacheProvider } from '../cache/init';
import { EmailProvider } from '../email/init';

// Services
container.registerSingleton(TOKENS.AuthService, AuthService);
container.registerSingleton(TOKENS.UserService, UserService);
container.registerSingleton(TOKENS.BranchService, BranchService);
container.registerSingleton(TOKENS.RestaurantService, RestaurantService);
container.registerSingleton(TOKENS.RestaurantMemberService, RestaurantMemberService);
container.registerSingleton(TOKENS.ProductService, ProductService);
container.registerSingleton(TOKENS.CustomerAddressService, CustomerAddressService);
container.registerSingleton(TOKENS.PermissionCacheService, PermissionCacheService);
container.registerSingleton(TOKENS.MemberBranchCacheService, MemberBranchCacheService);

// Controllers
container.registerSingleton(TOKENS.AuthController, AuthController);
container.registerSingleton(TOKENS.BranchController, BranchController);
container.registerSingleton(TOKENS.CustomerAddressController, CustomerAddressController);
container.registerSingleton(TOKENS.ProductController, ProductController);
container.registerSingleton(TOKENS.RestaurantMemberController, RestaurantMemberController);
container.registerSingleton(TOKENS.RestaurantController, RestaurantController);
container.registerSingleton(TOKENS.UserController, UserController);

// lib/infrastructure
container.registerSingleton(TOKENS.Logger, Logger);

// used registerInstance here because we already have a singleton defined in lib/cache/init.ts
container.registerInstance(TOKENS.CacheProvider, cacheProvider);
container.registerInstance(TOKENS.EmailProvider, EmailProvider);

export { container };