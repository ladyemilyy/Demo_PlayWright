import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';
import { todos } from '../utils/testData';

test.describe('TodoMVC Tests', () => {

  test('Add a new todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();

    await todoPage.addTodo(todos.first);
    await todoPage.expectTodoCount(1);
  });

  test('Add multiple todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();

    await todoPage.addTodo(todos.first);
    await todoPage.addTodo(todos.second);

    await todoPage.expectTodoCount(2);
  });

  test('Complete a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();

    await todoPage.addTodo(todos.first);
    await todoPage.completeTodo(0);

    await expect(page.locator('.todo-list li')).toHaveClass(/completed/);
  });

  test('Filter active todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();

    await todoPage.addTodo(todos.first);
    await todoPage.addTodo(todos.second);

    await todoPage.completeTodo(0);
    await todoPage.activeFilter.click();

    await expect(todoPage.todoItems).toHaveCount(1);
  });

  test('Delete a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();

    await todoPage.addTodo(todos.first);
    await todoPage.deleteTodo(0);

    await todoPage.expectTodoCount(0);
  });

});