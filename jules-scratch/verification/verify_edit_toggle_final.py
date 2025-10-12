from playwright.sync_api import sync_playwright, Page, expect
import os

def run_writer_verification(page: Page):
    """
    Verifies the edit toggle functionality on the writer page.
    """
    base_url = "http://127.0.0.1:5001"
    writer_url = f"{base_url}/pages/writer.html"

    # Navigate to the writer page
    page.goto(writer_url)

    # --- Test Brainstorm Tab ---
    brainstorm_canvas = page.locator("#brainstorm-response-area")
    brainstorm_toggle = page.locator('.edit-toggle[data-target="brainstorm-response-area"]')
    expect(brainstorm_canvas).to_have_attribute("contenteditable", "false")
    expect(brainstorm_toggle).not_to_be_checked()
    brainstorm_toggle.click()
    expect(brainstorm_canvas).to_have_attribute("contenteditable", "true")
    expect(brainstorm_toggle).to_be_checked()

    # --- Test Outline Tab ---
    outline_tab_button = page.get_by_role("button", name="2. Outline")
    outline_tab_button.click()
    outline_canvas = page.locator("#outline-list")
    outline_toggle = page.locator('.edit-toggle[data-target="outline-list"]')
    expect(outline_canvas).to_have_attribute("contenteditable", "false")
    expect(outline_toggle).not_to_be_checked()
    outline_toggle.click()
    expect(outline_canvas).to_have_attribute("contenteditable", "true")
    expect(outline_toggle).to_be_checked()

    # --- Test Draft Tab ---
    draft_tab_button = page.get_by_role("button", name="3. Draft")
    draft_tab_button.click()
    treatment_canvas = page.locator("#treatment-canvas")
    treatment_toggle = page.locator('.edit-toggle[data-target="treatment-canvas"]')
    expect(treatment_canvas).to_have_attribute("contenteditable", "false")
    expect(treatment_toggle).not_to_be_checked()
    treatment_toggle.click()
    expect(treatment_canvas).to_have_attribute("contenteditable", "true")
    expect(treatment_toggle).to_be_checked()

    page.screenshot(path="jules-scratch/verification/writer_page_verified.png")

def run_element_verification(page: Page):
    """
    Verifies the edit toggle functionality on an element page (persona.html).
    """
    base_url = "http://127.0.0.1:5001"
    persona_url = f"{base_url}/pages/persona.html"

    # Navigate to the persona page
    page.goto(persona_url)

    # --- Test Notes Tab ---
    notes_tab_button = page.get_by_role("button", name="Notes")
    notes_tab_button.click()
    notes_textarea = page.locator("#custom-notes")
    notes_toggle = page.locator('.edit-toggle[data-target="custom-notes"]')
    expect(notes_textarea).to_be_disabled()
    expect(notes_toggle).not_to_be_checked()
    notes_toggle.click()
    expect(notes_textarea).to_be_enabled()
    expect(notes_toggle).to_be_checked()
    notes_textarea.type("Testing notes editability.")
    expect(notes_textarea).to_have_value("Testing notes editability.")

    page.screenshot(path="jules-scratch/verification/element_page_verified.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_writer_verification(page)
        run_element_verification(page)
        browser.close()

if __name__ == "__main__":
    main()