import { LoginPage } from '@features/login';
import { OverviewPage } from '@features/overview';
import { ProductsPage } from '@features/products';
import { NotFoundPage } from '@features/common';

const PATH_LOGIN = '/login';
// const PATH_REGISTER = '/register';
const PATH_OVERVIEW = '/overview';
const PATH_PRODUCTS = '/products';
const PATH_NOT_FOUND = '/404';

export const routes = [
    // Public
    { path: PATH_LOGIN, pageComponent: LoginPage, requiresAuth: false },
    // { path: PATH_REGISTER, pageComponent: RegisterPage, requiresAuth: false },
    { path: PATH_NOT_FOUND, pageComponent: NotFoundPage, requiresAuth: false },

    // Protected
    { path: PATH_OVERVIEW, pageComponent: OverviewPage, requiresAuth: true },
    { path: PATH_PRODUCTS, pageComponent: ProductsPage, requiresAuth: true },
];

export const defaultAuthenticatedRoute = PATH_OVERVIEW;
export const defaultUnauthenticatedRoute = PATH_LOGIN;
