// Using dynamic imports for lazy loading
const LoginPage = () => import('@features/login').then((m) => m.LoginPage);
const RegisterPage = () => import('@features/register').then((m) => m.RegisterPage);
const OverviewPage = () => import('@features/overview').then((m) => m.OverviewPage);
const ProductsPage = () => import('@features/products').then((m) => m.ProductsPage);
const ProductAddPage = () => import('@features/products').then((m) => m.ProductAddPage);
const ProfilePage = () => import('@features/profile').then((m) => m.ProfilePage);
const NotFoundPage = () => import('@features/common').then((m) => m.NotFoundPage);

const PATH_LOGIN = '/login';
const PATH_REGISTER = '/register';
const PATH_OVERVIEW = '/overview';
const PATH_PRODUCTS = '/products';
const PATH_PRODUCTS_ADD = '/products/add';
const PATH_PROFILE = '/profile';
const PATH_NOT_FOUND = '/404';

export const routes = [
    // Public
    { path: PATH_LOGIN, pageComponent: LoginPage, requiresAuth: false },
    { path: PATH_REGISTER, pageComponent: RegisterPage, requiresAuth: false },
    { path: PATH_NOT_FOUND, pageComponent: NotFoundPage, requiresAuth: false },

    // Protected
    { path: PATH_OVERVIEW, pageComponent: OverviewPage, requiresAuth: true },
    { path: PATH_PRODUCTS, pageComponent: ProductsPage, requiresAuth: true },
    { path: PATH_PRODUCTS_ADD, pageComponent: ProductAddPage, requiresAuth: true },
    { path: PATH_PROFILE, pageComponent: ProfilePage, requiresAuth: true },
];

export const defaultAuthenticatedRoute = PATH_OVERVIEW;
export const defaultUnauthenticatedRoute = PATH_LOGIN;
