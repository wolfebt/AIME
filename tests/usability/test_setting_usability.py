import os
import re
from playwright.sync_api import sync_playwright, expect

def run_test(playwright):
    # Get the absolute path to the HTML file
    absolute_path = os.path.abspath("pages/setting.html")
    file_url = f"file://{absolute_path}"

    # Get absolute paths for the asset files relative to this script's location
    script_dir = os.path.dirname(__file__)
    screenshot_path = os.path.abspath(os.path.join(script_dir, "test_setting_usability_results.png"))


    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- 1. Navigate to the Setting Architect page ---
    page.goto(file_url)

    # --- 2. Test API Key Modal (re-used from persona test) ---
    # Open modal
    settings_btn = page.locator("#settings-btn")
    settings_btn.click()
    modal_overlay = page.locator("#settings-modal-overlay")
    expect(modal_overlay).to_be_visible()

    # Enter a dummy API key
    api_key_input = page.locator("#api-key-input")
    api_key_input.fill("DUMMY_API_KEY_FOR_TESTING")

    # Save and check for toast
    save_btn = page.locator("#modal-save-btn")
    save_btn.click()
    toast = page.locator(".toast.success")
    expect(toast).to_have_text("API Key saved successfully!")
    expect(modal_overlay).to_be_hidden()

    # --- 3. Test Form Interactions ---
    # Fill a field to test clearing later
    page.locator("#setting-name").fill("Test Setting")

    # Test "Clear All Fields"
    clear_btn = page.locator("#clear-fields-button")
    clear_btn.click()
    expect(page.locator("#setting-name")).to_have_value("")

    # --- 4. Test "Guidance Gems" (Setting Specific) ---
    # This test verifies the new Setting-specific gems.
    # Open the "Location Type" modal
    page.get_by_role("button", name="Location Type", exact=True).click()
    # Select "Dense Urban Metropolis" in the modal
    modal_button = page.locator("#gem-modal-options-container").get_by_role("button", name="Dense Urban Metropolis")
    modal_button.click()
    # Save the selection
    page.locator("#gem-modal-save-btn").click()
    # Verify the pill appears on the main page
    expect(page.locator(".gem-pill-container .gem-selected-pill")).to_have_text("Dense Urban Metropolis")

    # --- 5. Test another Gem Category to be sure ---
    page.get_by_role("button", name="Architectural Style", exact=True).click()
    page.locator("#gem-modal-options-container").get_by_role("button", name="Gothic & Ornate").click()
    page.locator("#gem-modal-save-btn").click()
    expect(page.locator(".gem-pill-container .gem-selected-pill").nth(1)).to_have_text("Gothic & Ornate")

    # --- 6. Take Screenshot ---
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)