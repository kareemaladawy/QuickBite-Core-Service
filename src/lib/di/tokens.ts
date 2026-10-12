export const TOKENS = {
    // Services
    AuthService: Symbol.for('AuthService'),
    BranchService: Symbol.for('BranchService'),
    CustomerAddressService: Symbol.for('CustomerAddressService'),
    ProductService: Symbol.for('ProductService'),
    RestaurantMemberService: Symbol.for('RestaurantMemberService'),
    PermissionCacheService: Symbol.for('PermissionCacheService'),
    MemberBranchCacheService: Symbol.for('MemberBranchCacheService'),
    RestaurantService: Symbol.for('RestaurantService'),
    UserService: Symbol.for('UserService'),

    // Controllers
    AuthController: Symbol.for('AuthController'),
    BranchController: Symbol.for('BranchController'),
    CustomerAddressController: Symbol.for('CustomerAddressController'),
    ProductController: Symbol.for('ProductController'),
    RestaurantMemberController: Symbol.for('RestaurantMemberController'),
    RestaurantController: Symbol.for('RestaurantController'),
    UserController: Symbol.for('UserController'),

    // lib/infrastructure
    Logger: Symbol.for('Logger'),
    CacheProvider: Symbol.for('CacheProvider'),
};