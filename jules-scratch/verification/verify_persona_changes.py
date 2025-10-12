import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    server_url = "http://127.0.0.1:5001/pages/persona.html"
    screenshot_path = "jules-scratch/verification/verification.png"

    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        page.goto(server_url)

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
                                "text": "### Character Summary\n\n**Name**: Kaelen\n\n*A knight of the fallen kingdom.*"
                            }]
                        }
                    }]
                }
            )
        )

        # 1. Test Markdown Rendering
        # Check if marked is loaded
        is_marked_loaded = page.evaluate("typeof marked")
        print(f"marked loaded: {is_marked_loaded}")

        page.locator("#generate-button").click()
        response_container = page.locator("#response-container")
        # Wait for the response container to have some content.
        page.wait_for_function("document.getElementById('response-container').innerHTML.trim() !== ''")
        print(response_container.inner_html())
        expect(response_container.locator("h3")).to_have_text("Character Summary")
        expect(response_container.locator("strong")).to_have_text("Name")
        expect(response_container.locator("em")).to_have_text("A knight of the fallen kingdom.")

        # 2. Test Iteration Controls
        expect(page.locator("#iteration-controls")).to_be_visible()
        page.locator("#update-instructions").fill("Make him a rogue instead.")

        # Mock the iteration response
        page.route(
            "**/models/*:generateContent*",
            lambda route: route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                json={
                    "candidates": [{
                        "content": {
                            "parts": [{
                                "text": "### Character Summary\n\n**Name**: Kaelen\n\n*A rogue from the shadows.*"
                            }]
                        }
                    }]
                }
            )
        )
        page.locator("#iterate-button").click()
        expect(page.locator("em")).to_have_text("A rogue from the shadows.")

        # 3. Test New Button Confirmation
        page.locator("#persona-name").fill("Some Name")
        page.on("dialog", lambda dialog: dialog.dismiss()) # Test dismissing the dialog
        page.locator("#new-button").click()
        expect(page.locator("#persona-name")).to_have_value("Some Name") # Should not have cleared

        page.on("dialog", lambda dialog: dialog.accept()) # Test accepting the dialog
        page.locator("#new-button").click()
        expect(page.locator("#persona-name")).to_have_value("") # Should have cleared

        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        run_verification(p)