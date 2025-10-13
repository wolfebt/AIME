from playwright.sync_api import sync_playwright, expect

def verify_setting_page(page):
    """
    Verifies that the Setting Architect page loads correctly,
    the new tab structure is present, and the UI components are functional.
    """
    server_url = "http://127.0.0.1:5001/pages/setting.html"
    screenshot_path = "jules-scratch/verification/verification.png"

    page.goto(server_url)

    # 1. Verify the main layout and header
    expect(page.get_by_role("heading", name="Setting Architect")).to_be_visible()
    expect(page.locator(".workspace-layout")).to_be_visible()
    expect(page.locator(".main-column")).to_be_visible()
    expect(page.locator(".side-column")).to_be_visible()

    # 2. Verify all the new tabs are present
    tabs = [
        "Overview", "Geography & Environment", "Flora & Fauna",
        "History & Lore", "Culture & Society", "Key Locations", "Atmosphere"
    ]
    for tab_name in tabs:
        expect(page.get_by_role("button", name=tab_name)).to_be_visible()

    # 3. Click through each tab and verify its content is visible
    data_tabs = {
        "Overview": "overview",
        "Geography & Environment": "geography",
        "Flora & Fauna": "flora",
        "History & Lore": "history",
        "Culture & Society": "culture",
        "Key Locations": "locations",
        "Atmosphere": "atmosphere"
    }
    for tab_name, data_tab_value in data_tabs.items():
        page.get_by_role("button", name=tab_name).click()
        expect(page.locator(f"#{data_tab_value}-tab")).to_be_visible()

    # 4. Check a few specific fields to ensure they are rendered correctly
    page.get_by_role("button", name="Overview").click()
    expect(page.get_by_label("Setting Name")).to_be_visible()
    expect(page.get_by_label("Core Concept")).to_be_visible()

    page.get_by_role("button", name="Atmosphere").click()
    expect(page.get_by_label("Dominant Sights (Color Palette)")).to_be_visible()
    expect(page.get_by_label("Overall Mood / Vibe")).to_be_visible()

    # 5. Take a screenshot of the final state (Atmosphere tab active)
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_setting_page(page)
        browser.close()

if __name__ == "__main__":
    main()