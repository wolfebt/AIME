from playwright.sync_api import sync_playwright, expect
import re
import os
import json

def verify_writer_full_functionality():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        # Go to the page and set the API key
        page.goto("http://127.0.0.1:5001/pages/writer.html")
        page.evaluate("() => localStorage.setItem('AIME_API_KEY', 'DUMMY_KEY')")

        # Mock API responses
        page.route(re.compile("https://generativelanguage.googleapis.com/.*"), lambda route: route.fulfill(status=200, json={"candidates": [{"content": {"parts": [{"text": "Title: Test\nLogline: Test\nConcept: Test"}]}}]}))

        # --- Test Brainstorm Tab ---
        page.evaluate("() => { document.querySelector('.accordion-content').style.maxHeight = '1000px'; document.querySelector('.accordion-content').style.padding = '1.5rem'; }")
        page.locator("#main-prompt").fill("Test brainstorm")
        page.locator("#generate-button").click()
        expect(page.locator("#iterate-button")).to_be_visible()
        expect(page.locator(".brainstorm-card")).to_be_visible()
        page.locator("#update-instructions").fill("Make it better")
        page.locator("#iterate-button").click()
        expect(page.locator(".brainstorm-card")).to_be_visible()

        # Test save prompt
        with page.expect_download() as download_info:
            page.locator("#save-prompt-button").click()
        download = download_info.value
        assert download.suggested_filename.endswith(".writerprompt")

        # Test save content
        with page.expect_download() as download_info:
            page.locator("#save-content-button").click()
        download = download_info.value
        assert download.suggested_filename.endswith(".brainstorm")

        # --- Test Outline Tab ---
        page.locator(".writer-nav-button[data-tab='outline']").click()
        page.locator("#main-prompt").fill("Test outline")
        page.locator("#generate-button").click()
        expect(page.locator("#iterate-button")).to_be_visible()
        expect(page.locator(".outline-item")).to_be_visible()
        page.locator("#update-instructions").fill("Make it better")
        page.locator("#iterate-button").click()
        expect(page.locator(".outline-item")).to_be_visible()

        # Test save content
        with page.expect_download() as download_info:
            page.locator("#save-content-button").click()
        download = download_info.value
        assert download.suggested_filename.endswith(".outline")

        # --- Test Treatment Tab ---
        page.locator(".writer-nav-button[data-tab='treatment']").click()
        # Need to create an outline first for the treatment to be generated
        page.locator("#outline-list").evaluate("""
            () => {
                const li = document.createElement('li');
                li.className = 'outline-item';
                li.innerHTML = `<span class="outline-item-title">Test Point</span><p class="outline-item-description">Test Desc</p>`;
                document.getElementById('outline-list').innerHTML = '';
                document.getElementById('outline-list').appendChild(li);
            }
        """)
        page.locator("#generate-button").click()
        expect(page.locator("#iterate-button")).to_be_visible()
        expect(page.locator("#treatment-canvas")).not_to_contain_text("Please generate an outline first.")
        page.locator("#update-instructions").fill("Make it better")
        page.locator("#iterate-button").click()
        expect(page.locator("#treatment-canvas")).not_to_contain_text("Please generate an outline first.")

        # Test save content
        with page.expect_download() as download_info:
            page.locator("#save-content-button").click()
        download = download_info.value
        assert download.suggested_filename.endswith(".draft")

        # --- Test New Button ---
        page.locator("#new-button").click()
        expect(page.locator("#main-prompt")).to_have_value("")
        expect(page.locator("#brainstorm-response-area")).to_contain_text("Enter a core idea")

        # --- Test Load Button ---
        # Test loading a prompt
        prompt_content = {"assetType": "Writer Prompt", "savedAt": "2023-10-27T12:00:00.000Z", "fields": {"main-prompt": "Loaded Prompt"}}
        prompt_file_path = "test.writerprompt"
        with open(prompt_file_path, "w") as f:
            f.write(json.dumps(prompt_content))

        with page.expect_file_chooser() as fc_info:
            page.locator("#load-button").click()
        file_chooser = fc_info.value
        file_chooser.set_files(prompt_file_path)
        expect(page.locator("#main-prompt")).to_have_value("Loaded Prompt")

        # Take final screenshot
        page.screenshot(path="jules-scratch/verification/writer_full_verification.png")

        browser.close()
        os.remove(prompt_file_path)

if __name__ == "__main__":
    verify_writer_full_functionality()