import os
from playwright.sync_api import sync_playwright, expect

def run_test(playwright):
    # The server runs on port 5001 and serves files from the root.
    # The test should navigate to the page via the server.
    server_url = "http://127.0.0.1:5001/pages/faction.html"

    # Get absolute paths for the asset files relative to this script's location
    script_dir = os.path.dirname(__file__)
    txt_asset_path = os.path.abspath(os.path.join(script_dir, "test_asset.txt"))
    world_asset_path = os.path.abspath(os.path.join(script_dir, "test_world.world"))
    screenshot_path = os.path.abspath(os.path.join(script_dir, "test_faction_usability_results.png"))

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- 1. Navigate to the Faction Shaper page ---
    page.goto(server_url)
    expect(page).to_have_title("AIME - Faction Shaper")

    # --- 2. Test API Key Modal ---
    # Open modal
    page.locator("#settings-btn").click()
    modal_overlay = page.locator("#settings-modal-overlay")
    expect(modal_overlay).to_be_visible()

    # Enter a dummy API key
    page.locator("#api-key-input").fill("DUMMY_API_KEY_FOR_TESTING")

    # Save and check for toast
    page.locator("#modal-save-btn").click()
    toast = page.locator(".toast.success")
    expect(toast).to_have_text("API Key saved successfully!")
    expect(modal_overlay).to_be_hidden()

    # --- 3. Test Form Interactions & Tabs ---
    # Fill a field on the first tab
    page.locator("#faction-name").fill("The Solar Syndicate")
    expect(page.locator("#faction-name")).to_have_value("The Solar Syndicate")

    # Switch to the 'Ideology & Goals' tab and fill a field
    page.get_by_role("button", name="Ideology & Goals").click()
    ideology_tab = page.locator("#ideology-tab")
    expect(ideology_tab).to_be_visible()
    page.locator("#faction-ideology").fill("To control the solar energy market.")
    expect(page.locator("#faction-ideology")).to_have_value("To control the solar energy market.")

    # --- 4. Test "Guidance Gems" (Faction Specific) ---
    # First, open the "Guidance" accordion to make the gems visible
    page.get_by_role("button", name="Guidance").click()

    # Open the "Faction Type" modal
    page.get_by_role("button", name="Faction Type", exact=True).click()
    # Select "Mega-corporation" in the modal
    page.locator("#gem-modal-options-container").get_by_role("button", name="Mega-corporation").click()
    # Save the selection
    page.locator("#gem-modal-save-btn").click()
    # Verify the pill appears on the main page
    expect(page.locator(".gem-pill-container .gem-selected-pill")).to_have_text("Mega-corporation")

    # --- 5. Test "New" button (formerly Clear All Fields) ---
    page.locator("#new-button").click()
    expect(page.locator("#faction-name")).to_have_value("")
    expect(page.locator("#faction-ideology")).to_have_value("")
    # Verify that the guidance gem pill was also cleared
    expect(page.locator(".gem-pill-container .gem-selected-pill")).to_be_hidden()

    # --- 6. Test "Asset Hub" ---
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

    # --- 6. Take Screenshot ---
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)