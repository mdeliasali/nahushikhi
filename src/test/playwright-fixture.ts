import { test as baseTest, expect, Page } from "@playwright/test";
import { LoginPage } from "./pages/login.page";
import { HomePage } from "./pages/home.page";
import { AdminDashboard } from "./pages/admin-dashboard.page";
import { ProductDetailsPage } from "./pages/product-details.page";
import { CartPage } from "./pages/cart.page";
import { CheckoutPage } from "./pages/checkout.page";
import { OrderHistoryPage } from "./pages/order-history.page";
import { MyAccountPage } from "./pages/my-account.page";

// Define custom fixtures with typed pages
interface CustomFixtures {
  loginPage: LoginPage;
  homePage: HomePage;
  adminDashboard: AdminDashboard;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  orderHistoryPage: OrderHistoryPage;
  myAccountPage: MyAccountPage;
}

// Create enhanced test fixture
export const test = baseTest.extend<CustomFixtures>({
  // Initialize pages in the fixtures
  loginPage: async ({ page }: { page: Page }, use: (r: LoginPage) => Promise<void>) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }: { page: Page }, use: (r: HomePage) => Promise<void>) => {
    await use(new HomePage(page));
  },
  adminDashboard: async ({ page }: { page: Page }, use: (r: AdminDashboard) => Promise<void>) => {
    await use(new AdminDashboard(page));
  },
  productDetailsPage: async ({ page }: { page: Page }, use: (r: ProductDetailsPage) => Promise<void>) => {
    await use(new ProductDetailsPage(page));
  },
  cartPage: async ({ page }: { page: Page }, use: (r: CartPage) => Promise<void>) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }: { page: Page }, use: (r: CheckoutPage) => Promise<void>) => {
    await use(new CheckoutPage(page));
  },
  orderHistoryPage: async ({ page }: { page: Page }, use: (r: OrderHistoryPage) => Promise<void>) => {
    await use(new OrderHistoryPage(page));
  },
  myAccountPage: async ({ page }: { page: Page }, use: (r: MyAccountPage) => Promise<void>) => {
    await use(new MyAccountPage(page));
  },
});

// Export other utilities
export { expect };

