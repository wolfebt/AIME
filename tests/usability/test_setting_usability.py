import os
import re
from playwright.sync_api import sync_playwright, expect

def run_test(playwright):
    # The server runs on port 5001 and serves files from the root.
    # The test should navigate to the page via the server.
    server_url = "http://127.0.0.1:5001/pages/setting.html"

    # Get absolute paths for the asset files relative to this script's location
    script_dir = os.path.dirname(__file__)
    screenshot_path = os.path.abspath(os.path.join(script_dir, "test_setting_usability_results.png"))


    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- 1. Navigate to the Setting Architect page ---
    page.goto(server_url)

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

    # --- 3. Test Form Interactions & Tab Functionality ---
    # Verify Core Identity tab is active by default
    expect(page.get_by_role("button", name="Core Identity")).to_have_class(re.compile(r"active"))
    expect(page.locator("#core-identity-tab")).to_have_class(re.compile(r"active"))

    # Fill a field in the first tab
    page.locator("#setting-name").fill("Test Setting")
    expect(page.locator("#setting-name")).to_have_value("Test Setting")

    # Click and verify Environment tab
    page.get_by_role("button", name="Environment & Inhabitants").click()
    expect(page.get_by_role("button", name="Environment & Inhabitants")).to_have_class(re.compile(r"active"))
    expect(page.locator("#environment-tab")).to_have_class(re.compile(r"active"))
    expect(page.locator("#core-identity-tab")).not_to_have_class(re.compile(r"active"))

    # Fill a field in the second tab
    page.locator("#setting-geography").fill("Test Geography")
    expect(page.locator("#setting-geography")).to_have_value("Test Geography")

    # --- 4. Test "Guidance Gems" (Setting Specific) ---
    # This test verifies the new Setting-specific gems.
    # First, open the "Guidance" accordion to make the gems visible
    page.get_by_role("button", name="Guidance").click()

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

    # --- 6. Test "New" button ---
    new_btn = page.locator("#new-button")
    new_btn.click()

    # Verify field on a non-active tab is cleared
    expect(page.locator("#setting-geography")).to_have_value("")

    # Switch back to first tab and verify it's also cleared
    page.get_by_role("button", name="Core Identity").click()
    expect(page.locator("#setting-name")).to_have_value("")

    # Verify that the guidance gem pills were also cleared
    expect(page.locator(".gem-pill-container .gem-selected-pill")).to_be_hidden()

    # --- 7. Take Screenshot ---
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)