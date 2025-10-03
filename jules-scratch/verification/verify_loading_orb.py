import os
import asyncio
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    # Get absolute paths to the HTML files
    persona_path = os.path.abspath("pages/persona.html")
    persona_url = f"file://{persona_path}"

    # Get absolute path for the screenshot
    screenshot_dir = os.path.abspath("jules-scratch/verification")
    screenshot_path = os.path.join(screenshot_dir, "loading_orb_verification.png")

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- Verify Loading Orb on Persona Page ---

    # Mock the API call to keep the loading spinner visible
    # We use a lambda that returns an unresolved promise to hang the request
    page.route("http://127.0.0.1:5001/api/proxy", lambda route: asyncio.sleep(10))

    # Navigate to the page
    page.goto(persona_url)

    # Click the generate button to trigger the loading indicator
    page.locator("#generate-button").click()

    # Wait for the loading spinner to be visible
    loading_spinner = page.locator(".loading-spinner")
    expect(loading_spinner).to_be_visible()

    # Give the animation time to start
    page.wait_for_timeout(500)

    # Take a screenshot of the response container which holds the orb
    response_container = page.locator("#response-container")
    response_container.screenshot(path=screenshot_path)
    print(f"Loading orb screenshot saved to {screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)