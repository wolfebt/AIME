import os
from playwright.sync_api import sync_playwright, expect

def run_test(playwright):
    server_url_persona = "http://127.0.0.1:5001/pages/persona.html"
    screenshot_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "verification.png"))

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # --- Verify on Persona Page ---
    page.goto(server_url_persona)

    # Set a dummy API key to avoid the alert
    page.evaluate("localStorage.setItem('AIME_API_KEY', 'DUMMY_API_KEY_FOR_TESTING')")

    # Mock the API response
    page.route(
        "**/models/*:generateContent*",
        lambda route: route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            json={
                "candidates": [{
                    "content": {
                        "parts": [{
                            "text": "This is some generated text to test the floating toolbar on the persona page."
                        }]
                    }
                }]
            }
        )
    )

    # Generate content
    page.locator("#generate-button").click()

    # Select the generated text
    response_container = page.locator("#response-container")
    expect(response_container).to_have_text("This is some generated text to test the floating toolbar on the persona page.")
    response_container.select_text()

    # Verify the toolbar is visible again
    toolbar = page.locator("#text-toolbar")
    expect(toolbar).to_be_visible()

    # Wait a moment to ensure the toolbar is rendered for the screenshot
    page.wait_for_timeout(500)

    # Take screenshot
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)