import os
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    # Get the absolute path to the HTML file
    # This makes the script runnable from anywhere
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up three levels from jules-scratch/verification to the root
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..'))
    file_path = os.path.join(project_root, 'pages', 'persona.html')
    file_url = f'file://{file_path}'

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # 1. Arrange: Go to the persona page.
    page.goto(file_url)

    # 2. Assert: Check a standard input field
    # We'll check the 'Name' input field as a representative example.
    # Using exact=True to avoid ambiguity with "Aliases & Nicknames"
    name_input = page.get_by_label("Name", exact=True)
    expect(name_input).to_have_attribute("autocomplete", "off")

    # 3. Assert: Check a custom field input
    # Find the container for custom fields
    custom_fields_container = page.locator("#custom-fields-container")
    # Find the first key and value inputs within that container
    custom_key_input = custom_fields_container.locator(".custom-field-key").first
    custom_value_input = custom_fields_container.locator(".custom-field-value").first

    expect(custom_key_input).to_have_attribute("autocomplete", "off")
    expect(custom_value_input).to_have_attribute("autocomplete", "off")

    # 4. Screenshot: Capture the page for visual confirmation.
    # The main purpose is to show the page renders correctly after the changes.
    screenshot_path = os.path.join(project_root, 'jules-scratch', 'verification', 'verification.png')
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)