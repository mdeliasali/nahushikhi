import { Page } from "@playwright/test";

export class LoginPage {
  constructor(protected page: Page) {}
  async goto() {
    await this.page.goto("/auth");
  }
}
