import re
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Go to the persona page using an absolute file path
    page.goto("file:///app/pages/persona.html")

    # 1. Verify that the panels are no longer accordions
    # We find the panel by its title and then check its parent container.
    guidance_panel_title = page.get_by_role("heading", name="Guidance")
    asset_hub_panel_title = page.get_by_role("heading", name="Asset Hub")

    # The titles are within the static panel containers
    guidance_panel = guidance_panel_title.locator("xpath=..")
    asset_hub_panel = asset_hub_panel_title.locator("xpath=..")

    # Assert that they have the new static panel classes and not the old accordion class
    expect(guidance_panel).to_have_class(re.compile(r"guidance-gems-panel"))
    expect(guidance_panel).not_to_have_class(re.compile(r"accordion"))

    expect(asset_hub_panel).to_have_class(re.compile(r"asset-hub-panel"))
    expect(asset_hub_panel).not_to_have_class(re.compile(r"accordion"))

    # 2. Verify the Asset Hub expands on file upload
    # Create a dummy file to upload
    file_content = '{"assetType": "TEXT", "traits": {"name": "Test Asset"}}'
    file_path = "jules-scratch/verification/test_asset.json"
    with open(file_path, "w") as f:
        f.write(file_content)

    # Set the input files for the file chooser
    file_input = page.locator("#asset-upload")
    file_input.set_input_files(file_path)

    # 3. Assert that the new asset appears in the list
    asset_list = page.locator("#asset-list")
    new_asset_item = asset_list.get_by_text("test_asset.json")
    expect(new_asset_item).to_be_visible()

    # 4. Take a screenshot for visual confirmation
    page.screenshot(path="jules-scratch/verification/static_panels_verification.png")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)

print("Verification script executed successfully.")