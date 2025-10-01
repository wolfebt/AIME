import os
from playwright.sync_api import sync_playwright, expect

def run_test(playwright):
    # Get the absolute path to the HTML file
    # This is necessary because Playwright's page.goto() needs a proper URL or file path.
    absolute_path = os.path.abspath("pages/persona.html")
    file_url = f"file://{absolute_path}"

    # Get absolute paths for the asset files relative to this script's location
    script_dir = os.path.dirname(__file__)
    txt_asset_path = os.path.abspath(os.path.join(script_dir, "test_asset.txt"))
    world_asset_path = os.path.abspath(os.path.join(script_dir, "test_world.world"))
    screenshot_path = os.path.abspath(os.path.join(script_dir, "test_persona_usability_results.png"))


    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- 1. Navigate to the Persona Maker page ---
    page.goto(file_url)

    # --- 2. Test API Key Modal ---
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
    page.locator("#persona-name").fill("Test Name")

    # Test custom notes
    custom_notes_area = page.locator("#custom-notes")
    custom_notes_area.fill("These are some custom notes for testing.")
    expect(custom_notes_area).to_have_value("These are some custom notes for testing.")

    # Test "Clear All Fields"
    clear_btn = page.locator("#clear-fields-button")
    clear_btn.click()
    expect(page.locator("#persona-name")).to_have_value("")
    expect(page.locator("#custom-notes")).to_have_value("")

    # --- 4. Test "Guidance Gems" ---
    # Open the "Genre" modal
    page.get_by_role("button", name="Genre", exact=True).click()
    # Select "Fantasy" in the modal
    modal_fantasy_button = page.locator("#gem-modal-options-container").get_by_role("button", name="Fantasy")
    modal_fantasy_button.click()
    # Save the selection
    page.locator("#gem-modal-save-btn").click()
    # Verify the pill appears on the main page
    expect(page.locator(".gem-pill-container .gem-selected-pill")).to_have_text("Fantasy")

    # --- 5. Test "Asset Hub" ---
    # The Asset Hub is now a static panel, so no click is needed to expand it.

    # Set the files for the file chooser
    with page.expect_file_chooser() as fc_info:
        page.locator("#import-asset-btn").click()
    file_chooser = fc_info.value
    file_chooser.set_files([txt_asset_path, world_asset_path])

    # Verify assets are rendered in the list
    asset_list = page.locator("#asset-list")
    expect(asset_list.get_by_text("test_asset.txt")).to_be_visible()
    expect(asset_list.get_by_text("test_world.world")).to_be_visible()
    expect(asset_list.locator(".asset-icon-aime")).to_have_text("WORL")

    # --- 6. Test File-Naming Bug Fix ---
    # Enter a name with only whitespace
    page.locator("#persona-name").fill("    ")

    # Add some other data for context
    page.locator("#persona-archetype").fill("The Tester")
    page.locator("#persona-pitch").fill("A persona designed to test the system.")

    # --- 7. Take Screenshot ---
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)