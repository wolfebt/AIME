from playwright.sync_api import Page, expect, sync_playwright
import re

def test_element_generation(page: Page):
    """
    Tests that the element generation workflow functions correctly.
    """
    # 1. Navigate to the Persona page
    page.goto("http://127.0.0.1:5001/pages/persona.html")

    # 2. Mock the API response
    mock_response = {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": """
# Arion the Sun-Forged

## Core Identity
A stoic guardian, the last of an ancient order.

## Appearance & Mannerisms
Tall and powerfully built, with sun-bleached hair.

## Narrative Profile
Driven by a deep sense of duty.
"""
                }]
            }
        }]
    }
    page.route("https://generativelanguage.googleapis.com/**", lambda route: route.fulfill(status=200, json=mock_response))

    # 3. Click the generate button
    page.locator("#generate-button").click()

    # 4. Verify the response is rendered correctly
    expect(page.locator("#response-container")).to_contain_text("Arion the Sun-Forged")
    expect(page.locator("#response-container h1")).to_have_text("Arion the Sun-Forged")
    expect(page.locator("#response-container h2")).to_have_count(3)

    # 5. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        test_element_generation(page)
        browser.close()