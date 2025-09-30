import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    """
    This script verifies the functionality of the new multi-select
    Guidance modal in the Story Weaver, including the new styling.
    """
    # --- Setup ---
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get absolute paths
    script_dir = os.path.dirname(__file__)
    writer_page_path = os.path.abspath(os.path.join(script_dir, "../..", "pages/writer.html"))
    screenshot_path = os.path.abspath(os.path.join(script_dir, "verification.png"))

    # --- Test Execution ---
    page.goto(f"file://{writer_page_path}")

    # --- 1. Select Multiple Genres ---
    # Click the "Genre" button to open the modal
    genre_button = page.locator('.gem-category-button:has-text("Genre")')
    genre_button.click()

    # Wait for the modal to be visible
    modal = page.locator("#gem-selection-modal-overlay")
    expect(modal).to_be_visible()
    expect(modal.locator("#gem-modal-title")).to_have_text("Select Genre")

    # Select "Fantasy" and "Sci-Fi" by clicking the buttons
    modal.locator('.gem-modal-option-button:has-text("Fantasy")').click()
    modal.locator('.gem-modal-option-button:has-text("Sci-Fi")').click()

    # Save the selection
    modal.locator("#gem-modal-save-btn").click()

    # --- 2. Verify Genre Selection ---
    # Modal should be hidden
    expect(modal).to_be_hidden()

    # Verify the correct pills are displayed
    genre_container = page.locator('.gem-category-container[data-category="Genre"]')
    expect(genre_container.locator('.gem-selected-pill:has-text("Fantasy")')).to_be_visible()
    expect(genre_container.locator('.gem-selected-pill:has-text("Sci-Fi")')).to_be_visible()

    # --- 3. Select Multiple Tones ---
    # Click the "Tone" button to open the modal
    tone_button = page.locator('.gem-category-button:has-text("Tone")')
    tone_button.click()

    # Wait for the modal to be visible
    expect(modal).to_be_visible()
    expect(modal.locator("#gem-modal-title")).to_have_text("Select Tone")

    # Select "Dark" and "Humorous" by clicking the buttons
    modal.locator('.gem-modal-option-button:has-text("Dark")').click()
    modal.locator('.gem-modal-option-button:has-text("Humorous")').click()

    # --- 4. Take Screenshot of Modal ---
    # We'll take the screenshot while the modal is open to show the new selection style
    modal.screenshot(path=screenshot_path)
    print(f"Screenshot of modal saved to {screenshot_path}")

    # Save the selection
    modal.locator("#gem-modal-save-btn").click()

    # --- Cleanup ---
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)