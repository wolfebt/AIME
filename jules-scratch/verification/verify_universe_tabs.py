import os
import re
from playwright.sync_api import Page, expect, sync_playwright

def verify_universe_tabs(page: Page):
    """
    This test verifies that the tabbed interface on universe.html works correctly.
    """
    # 1. Arrange: Go to the universe.html page.
    page.goto(f"file://{os.path.abspath('pages/universe.html')}")

    # 2. Assert: Check that the "Core Concept" tab is active by default.
    core_concept_button = page.get_by_role("button", name="Core Concept")
    core_concept_tab = page.locator("#core-concept-tab")
    expect(core_concept_button).to_have_class(re.compile(r"active"))
    expect(core_concept_tab).to_have_class(re.compile(r"active"))

    # 3. Act: Click on the "Rules of Reality" tab.
    rules_of_reality_button = page.get_by_role("button", name="Rules of Reality")
    rules_of_reality_button.click()

    # 4. Assert: Check that the "Rules of Reality" tab is now active.
    rules_of_reality_tab = page.locator("#rules-of-reality-tab")
    expect(rules_of_reality_button).to_have_class(re.compile(r"active"))
    expect(rules_of_reality_tab).to_have_class(re.compile(r"active"))

    # 5. Assert: Check that the "Core Concept" tab is no longer active.
    expect(core_concept_button).not_to_have_class(re.compile(r"active"))
    expect(core_concept_tab).not_to_have_class(re.compile(r"active"))

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/universe_tabs_verification.png")

# Boilerplate to run the test
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_universe_tabs(page)
        browser.close()