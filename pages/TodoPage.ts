import { Page, Locator, expect } from '@playwright/test';

export class TodoPage {
    readonly page: Page;
    readonly todoInput: Locator;
    readonly todoItems: Locator;
    readonly activeFilter: Locator;
    readonly completedFilter: Locator;
    readonly allFilter: Locator;
    readonly clearCompletedButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.todoInput = page.getByPlaceholder('What needs to be done?');
        this.todoItems = page.locator('.todo-list li');
        this.activeFilter = page.getByRole('link', { name: 'Active' });
        this.completedFilter = page.getByRole('link', { name: 'Completed' });
        this.allFilter = page.getByRole('link', { name: 'All' });
        this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    }

    async navigate() {
        await this.page.goto('/');
    }

    async addTodo(todo: string) {
        await this.todoInput.fill(todo);
        await this.todoInput.press('Enter');
    }

    async completeTodo(index: number) {
        await this.todoItems.nth(index).locator('.toggle').check();
    }

    async deleteTodo(index: number) {
        await this.todoItems.nth(index).hover();
        await this.todoItems.nth(index).locator('.destroy').click();
    }

    async expectTodoCount(count: number) {
        await expect(this.todoItems).toHaveCount(count);
    }
}