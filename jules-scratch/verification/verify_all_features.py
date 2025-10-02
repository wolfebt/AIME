import os
import re
from playwright.sync_api import Page, expect

def verify_all_features(page: Page):
    """
    This script verifies that both the main text generation and the AIME chatbot
    are functional after the model name fix.
    """
    # Get absolute path to the page
    absolute_path = "file://" + os.path.abspath("pages/persona.html")
    page.goto(absolute_path)

    # Set a dummy API key to allow requests to be made
    page.evaluate("() => localStorage.setItem('AIME_API_KEY', 'DUMMY_KEY')")

    # --- 1. Verify the main 'Generate' button ---
    # Fill in a field to provide context for generation
    page.locator("#name").fill("Captain Eva Rostova")

    # Click the generate button
    page.locator("#generate-button").click()

    # Expect a response in the main output field (we check for any text content)
    # The API call will fail with a dummy key, but we expect an error message.
    expect(page.locator("#core-concept-output")).to_contain_text("Error", timeout=10000)


    # --- 2. Verify the AIME Chatbot ---
    # Open the AIME Chatbot
    page.locator("#aime-chat-btn").click()
    chat_modal = page.locator("#aime-chat-modal")
    expect(chat_modal).to_be_visible()

    # Send a message
    page.locator("#aime-chat-input").fill("Hello, AIME!")
    page.locator("#aime-chat-send-btn").click()

    # Expect a response from the chatbot (again, an error is expected with a dummy key)
    expect(page.locator(".aime-chat-message.error")).to_be_visible(timeout=10000)
    expect(page.locator(".aime-chat-message.error")).to_contain_text("Failed to connect to AI service")

    # --- 3. Capture the final state ---
    screenshot_path = "jules-scratch/verification/verification.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {os.path.abspath(screenshot_path)}")

# Boilerplate to run the verification
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_all_features(page)
        browser.close()

if __name__ == "__main__":
    run_verification()