import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    # Get absolute paths to the HTML files
    persona_path = os.path.abspath("pages/persona.html")
    writer_path = os.path.abspath("pages/writer.html")
    persona_url = f"file://{persona_path}"
    writer_url = f"file://{writer_path}"

    # Get absolute path for the screenshot
    screenshot_dir = os.path.abspath("jules-scratch/verification")
    persona_screenshot_path = os.path.join(screenshot_dir, "persona_buttons_verification.png")
    writer_screenshot_path = os.path.join(screenshot_dir, "writer_buttons_verification.png")

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- Verify Persona Page ---
    page.goto(persona_url)

    # 1. Check that the "Clear All Fields" button is gone
    clear_button = page.locator("#clear-fields-button")
    expect(clear_button).to_be_hidden()

    # 2. Check that the "New" and "Load" buttons are present
    generation_controls = page.locator(".generation-controls-buttons")
    new_button = generation_controls.locator("#new-button")
    load_button = generation_controls.locator("#load-button")

    expect(new_button).to_be_visible()
    expect(new_button).to_have_text("New")
    expect(load_button).to_be_visible()
    expect(load_button).to_have_text("Load")

    # 3. Take a screenshot
    page.screenshot(path=persona_screenshot_path)
    print(f"Persona page screenshot saved to {persona_screenshot_path}")

    # --- Verify Writer Page ---
    page.goto(writer_url)

    # 1. Check that the "New" and "Load" buttons are present
    writer_gen_controls = page.locator(".generation-controls-buttons")
    writer_new_button = writer_gen_controls.locator("#new-button")
    writer_load_button = writer_gen_controls.locator("#load-button")

    expect(writer_new_button).to_be_visible()
    expect(writer_new_button).to_have_text("New")
    expect(writer_load_button).to_be_visible()
    expect(writer_load_button).to_have_text("Load")

    # 2. Take a screenshot
    page.screenshot(path=writer_screenshot_path)
    print(f"Writer page screenshot saved to {writer_screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)