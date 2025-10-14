from playwright.sync_api import sync_playwright, expect
import re

def verify_writer_workflow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})

        # Set a dummy API key in local storage
        page.goto("http://127.0.0.1:5001/pages/writer.html")
        page.evaluate("() => localStorage.setItem('AIME_API_KEY', 'DUMMY_KEY')")

        # --- Mock API Responses ---
        page.route(
            re.compile("https://generativelanguage.googleapis.com/.*"),
            lambda route: route.fulfill(
                status=200,
                json={
                    "candidates": [{
                        "content": { "parts": [{ "text": "Title: Test\nLogline: Test\nConcept: Test" }] }
                    }]
                }
            )
        )

        # --- Test Brainstorm Tab ---
        page.locator(".accordion-header", has_text="Generation Controls").click()
        page.wait_for_timeout(1000) # Allow accordion animation to complete
        page.locator("#main-prompt").fill("Test brainstorm")
        page.locator("#generate-button").click()
        expect(page.locator("#iterate-button")).to_be_visible()
        expect(page.locator(".brainstorm-card")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/writer_brainstorm.png")

        # --- Test Outline Tab ---
        page.locator(".writer-nav-button[data-tab='outline']").click()
        page.locator("#main-prompt").fill("Test outline")
        page.locator("#generate-button").click()
        expect(page.locator("#iterate-button")).to_be_visible()
        expect(page.locator(".outline-item")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/writer_outline.png")

        # --- Test Treatment Tab ---
        page.locator(".writer-nav-button[data-tab='treatment']").click()
        # Need to create an outline first for the treatment to be generated
        page.locator("#outline-list").evaluate("""
            () => {
                const li = document.createElement('li');
                li.className = 'outline-item';
                li.innerHTML = `<span class="outline-item-title">Test Point</span><p class="outline-item-description">Test Desc</p>`;
                document.getElementById('outline-list').appendChild(li);
            }
        """)
        page.locator("#generate-button").click()
        expect(page.locator("#iterate-button")).to_be_visible()
        expect(page.locator("#treatment-canvas")).not_to_contain_text("Please generate an outline first.")
        page.screenshot(path="jules-scratch/verification/writer_treatment.png")

        browser.close()

if __name__ == "__main__":
    verify_writer_workflow()