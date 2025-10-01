import os
import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    # --- Setup ---
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get absolute paths
    script_dir = os.path.dirname(__file__)
    writer_page_path = os.path.abspath(os.path.join(script_dir, "../../pages/writer.html"))
    screenshot_path = os.path.abspath(os.path.join(script_dir, "verification.png"))

    # --- Test Steps ---
    page.goto(f"file://{writer_page_path}")

    # Set a dummy API key in localStorage.
    # NOTE: This test will fail if the dummy key is invalid.
    # The purpose is to verify the UI flow, not the key itself.
    # A real key would be needed for a true end-to-end test.
    page.evaluate("localStorage.setItem('AIME_API_KEY', 'ASK_USER_FOR_A_REAL_KEY_IF_NEEDED')")

    # Fill the prompt and generate
    page.locator("#main-prompt").fill("A story about a brave little toaster.")
    page.locator("#generate-button").click()

    # Wait for the loading text to disappear and the response to appear.
    # We expect an error message because the API key is fake.
    # This still verifies that the API call was made and the UI updated.
    error_text_locator = page.get_by_text(re.compile("Error: API Error", re.IGNORECASE))

    # Expect the error message to be visible
    expect(error_text_locator).to_be_visible(timeout=20000)

    # Take a screenshot
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    # --- Cleanup ---
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)