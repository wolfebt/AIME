import os
import json
import asyncio
from playwright.sync_api import sync_playwright, expect

# --- Test Data ---
PERSONA_NAME = "TestSubject-95B"
PERSONA_FILENAME = "testsubject-95b.persona"

WRITER_PROMPT = "An animal adventure"

def run_test(playwright):
    # --- Setup ---
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get absolute paths
    script_dir = os.path.dirname(__file__)
    persona_page_url = "http://127.0.0.1:5001/pages/persona.html"
    writer_page_url = "http://127.0.0.1:5001/pages/writer.html"
    download_path = os.path.abspath(os.path.join(script_dir, PERSONA_FILENAME))
    screenshot_path = os.path.abspath(os.path.join(script_dir, "test_writer_compatibility_results.png"))

    # --- Part 1: Create and Save the Persona Asset ---
    page.goto(persona_page_url)

    # Fill the form with unique data
    page.locator("#persona-name").fill(PERSONA_NAME)

    # Listen for the download event and save the file
    with page.expect_download() as download_info:
        page.locator("#save-asset-button").click()
    download = download_info.value
    download.save_as(download_path)

    # Verify the file was saved
    assert os.path.exists(download_path), f"Failed to save persona file to {download_path}"

    # --- Part 2: Import Asset into Story Writer ---
    page.goto(writer_page_url)

    # Set the API key in localStorage for the writer page's origin
    # This is crucial because file:// origins are sandboxed
    page.evaluate("localStorage.setItem('AIME_API_KEY', 'DUMMY_API_KEY_FOR_TESTING')")

    # The Asset Hub is no longer an accordion, so no click is needed to expand it.

    # Import the saved persona file
    with page.expect_file_chooser() as fc_info:
        page.locator("#import-asset-btn").click()
    file_chooser = fc_info.value
    file_chooser.set_files(download_path)

    # Verify the asset appears in the list
    asset_list = page.locator("#asset-list")
    expect(asset_list.get_by_text(PERSONA_FILENAME)).to_be_visible()

    # --- Part 3: Verify Prompt Integration ---

    # This flag will be set to True if the assertion inside the handler passes
    prompt_verified = False

    def handle_api_request(route):
        nonlocal prompt_verified
        request = route.request
        post_data = json.loads(request.post_data)

        # Extract the prompt text sent to the AI
        super_prompt = post_data['contents'][0]['parts'][0]['text']

        # Check if the unique persona data is in the prompt
        if PERSONA_NAME in super_prompt:
            prompt_verified = True

        # Fulfill the request with a dummy response that matches the expected format (3 concepts separated by '---')
        dummy_ai_text = (
            "Title: Test Success\n"
            "Logline: The test was successful.\n"
            "Concept: A dummy response was provided to verify the test's interception logic.\n"
            "---\n"
            "Title: Another Idea\n"
            "Logline: A second concept to ensure parsing works.\n"
            "Concept: This concept helps validate the frontend's ability to handle multiple items.\n"
            "---\n"
            "Title: A Third Option\n"
            "Logline: The final concept in the dummy payload.\n"
            "Concept: This ensures the full response structure is simulated correctly."
        )

        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "candidates": [{
                    "content": {
                        "parts": [{"text": dummy_ai_text}],
                        "role": "model"
                    }
                }]
            })
        )

    # Intercept network requests to the Google AI API
    # The URL must match the one constructed in writer-bundle.js
    page.route("**/models/*:generateContent*", handle_api_request)

    # Fill the main prompt and click the generate button
    page.locator("#main-prompt").fill(WRITER_PROMPT)
    page.locator("#generate-button").click()

    # Wait for the response area to update to ensure the API call was processed
    expect(page.get_by_text("Test Success")).to_be_visible()

    # Final assertion to confirm the prompt content was correct
    assert prompt_verified, "The imported persona asset data was not found in the AI prompt."
    print("Prompt integration verified successfully.")

    # --- 4. Take Final Screenshot ---
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    # --- Cleanup ---
    browser.close()
    if os.path.exists(download_path):
        os.remove(download_path)

if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)