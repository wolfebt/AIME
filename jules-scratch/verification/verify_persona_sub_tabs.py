from playwright.sync_api import Page, expect, sync_playwright

def test_persona_sub_tabs(page: Page):
    """
    Tests that the new sub-tabbed layout on the Persona page functions correctly.
    """
    # 1. Navigate to the Persona page
    page.goto("http://127.0.0.1:5001/pages/persona.html")

    # 2. Test Profile sub-tabs
    page.locator("[data-tab='profile']").click()
    expect(page.locator("#vitals-sub-tab")).to_be_visible()
    expect(page.locator("#physicality-sub-tab")).to_be_hidden()
    page.screenshot(path="jules-scratch/verification/01_profile_vitals.png")
    page.locator("[data-sub-tab='physicality']").click()
    expect(page.locator("#vitals-sub-tab")).to_be_hidden()
    expect(page.locator("#physicality-sub-tab")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/02_profile_physicality.png")

    # 3. Test Backstory sub-tabs
    page.locator("[data-tab='backstory']").click()
    expect(page.locator("#profile-tab")).to_be_hidden()
    expect(page.locator("#history-sub-tab")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/03_backstory_history.png")

    # 4. Test Psychology sub-tabs
    page.locator("[data-tab='psychology']").click()
    expect(page.locator("#makeup-sub-tab")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/04_psychology_makeup.png")

    # 5. Test Genre sub-tabs
    page.locator("[data-tab='genre']").click()
    expect(page.locator("#fantasy-sub-tab")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/05_genre_fantasy.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        test_persona_sub_tabs(page)
        browser.close()