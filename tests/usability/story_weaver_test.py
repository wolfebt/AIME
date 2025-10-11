import re
import json
from playwright.sync_api import Page, expect, sync_playwright

# It's a good practice to define the URL and any other constants at the top
BASE_URL = "http://127.0.0.1:5001/pages/writer.html"

# --- Test Functions ---

def test_initial_ui_and_state(page: Page):
    """
    Tests that the Story Weaver page loads correctly and all initial UI elements are present.
    """
    # 1. Navigate to the page
    page.goto(BASE_URL)

    # 2. Check for header and navigation
    expect(page.locator("a.logo-title")).to_have_text("AIME")
    expect(page.locator("nav.main-nav >> a[href='writer.html']")).to_have_class("active")

    # 3. Check for the three main tabs and ensure Brainstorm is active
    expect(page.locator(".writer-nav-button[data-tab='brainstorm']")).to_be_visible()
    expect(page.locator(".writer-nav-button[data-tab='outline']")).to_be_visible()
    expect(page.locator(".writer-nav-button[data-tab='treatment']")).to_be_visible()
    expect(page.locator(".writer-nav-button[data-tab='brainstorm']")).to_have_class(re.compile(r"\bactive\b"))

    # 4. Check that the correct tab content is visible
    expect(page.locator("#brainstorm-tab")).to_have_class(re.compile(r"\bactive\b"))
    expect(page.locator("#outline-tab")).not_to_have_class(re.compile(r"\bactive\b"))
    expect(page.locator("#treatment-tab")).not_to_have_class(re.compile(r"\bactive\b"))

    # 5. Check for side column elements
    expect(page.locator("#main-prompt")).to_be_visible()
    expect(page.locator("#generate-button")).to_have_text("Brainstorm Concepts")

    # Open the Guidance accordion to check its contents
    page.locator(".accordion-header", has_text="Guidance").click()
    expect(page.locator("#guidance-gems-container")).to_be_visible()

    expect(page.locator(".asset-hub-panel")).to_be_visible()

def test_guidance_gems_functionality(page: Page):
    """
    Tests the full functionality of the Guidance Gems modal.
    """
    page.goto(BASE_URL)

    # Open the Guidance accordion first
    page.locator(".accordion-header", has_text="Guidance").click()

    # 1. Open the modal for 'Genre'
    page.locator(".gem-category-button", has_text="Genre").click()
    expect(page.locator("#gem-selection-modal-overlay")).to_be_visible()
    expect(page.locator("#gem-modal-title")).to_have_text("Select Genre")

    # 2. Select default options
    page.locator(".gem-modal-option-button", has_text="Fantasy").click()
    page.locator(".gem-modal-option-button", has_text="Sci-Fi").click()

    # 3. Add a new custom gem
    page.locator("#custom-gem-input").fill("Cyberpunk")
    page.locator("#add-custom-gem-btn").click()
    expect(page.locator(".gem-modal-option-button", has_text="Cyberpunk")).to_have_class("gem-modal-option-button active")

    # 4. Save selections
    page.locator("#gem-modal-save-btn").click()
    expect(page.locator("#gem-selection-modal-overlay")).to_be_hidden()

    # 5. Verify the selected gems are displayed on the main page
    genre_container = page.locator(".gem-category-container[data-category='Genre']")
    expect(genre_container.locator(".gem-selected-pill", has_text="Fantasy")).to_be_visible()
    expect(genre_container.locator(".gem-selected-pill", has_text="Sci-Fi")).to_be_visible()
    expect(genre_container.locator(".gem-selected-pill", has_text="Cyberpunk")).to_be_visible()

def test_asset_hub_functionality(page: Page):
    """
    Tests the Asset Hub's file import and removal functionality.
    """
    page.goto(BASE_URL)

    # 1. Create dummy files to "upload"
    text_content = "This is a character bio."
    json_content = json.dumps({"name": "Dr. Aris", "role": "Protagonist"})

    # 2. "Upload" a text file and a JSON file
    page.locator("#asset-upload").set_input_files([
        {"name": "character.txt", "mimeType": "text/plain", "buffer": text_content.encode()},
        {"name": "world.json", "mimeType": "application/json", "buffer": json_content.encode()}
    ])

    # 3. Verify assets appear in the list
    expect(page.locator(".asset-item", has_text="character.txt")).to_be_visible()
    expect(page.locator(".asset-item", has_text="world.json")).to_be_visible()
    expect(page.locator(".asset-icon-text", has_text="TXT")).to_be_visible()
    expect(page.locator(".asset-icon-text", has_text="JSON")).to_be_visible()

    # 4. Remove an asset and verify it's gone
    page.locator(".asset-item", has_text="character.txt").locator(".remove-asset-btn").click()
    expect(page.locator(".asset-item", has_text="character.txt")).not_to_be_visible()
    expect(page.locator(".asset-item", has_text="world.json")).to_be_visible() # Ensure the other remains

def test_full_ai_workflow_e2e(page: Page):
    """
    Tests the complete AI generation workflow from Brainstorm to Draft using mocked API responses.
    """
    page.goto(BASE_URL)

    # --- Mock API Responses ---
    mock_brainstorm_response = {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": """
                        Title: The Crystal City
                        Logline: A lone explorer discovers a lost city powered by sentient crystals.
                        Concept: In a post-apocalyptic world, Elara follows ancient maps to find a city of legend. She must bond with the crystal consciousness to protect it from a faction that wants to exploit its power.
                        ---
                        Title: Star-Sailor's Echo
                        Logline: A deep-space scavenger finds a derelict ship containing the ghost of its former captain.
                        Concept: Kael, a cynical salvager, accidentally awakens the AI ghost of a famed star-sailor. The ghost, haunted by its final mission, guides Kael on a journey that could either lead to immense treasure or repeat its own tragic fate.
                        ---
                        Title: The Gilded Cage
                        Logline: In a city where emotions are currency, a young woman must risk everything to feel true love.
                        Concept: Anya lives in a society where emotions are harvested and traded. When she meets a man from the emotionless underclass, she is drawn into a dangerous black market of feelings, hunted by the authorities who control the emotional economy.
                    """
                }]
            }
        }]
    }

    mock_outline_response = {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": """
                        Title: The Discovery
                        Description: Elara, guided by her grandfather's journal, finds the hidden entrance to the Crystal City.
                        ---
                        Title: The First Contact
                        Description: She cautiously enters and makes first contact with the city's crystalline intelligence, which communicates through light and resonance.
                        ---
                        Title: The Inevitable Threat
                        Description: The Marauders, a tech-scavenging faction, detect the city's power signature and begin their approach.
                    """
                }]
            }
        }]
    }

    mock_draft_response = {
        "candidates": [{
            "content": {
                "parts": [{
                    "text": "The wind howled across the salt flats, whipping Elara's cloak around her. The journal in her hands was her only guide, its pages thin and brittle. She traced the final, faded line of the map to the base of a sheer cliff face that seemed to drink the light. There, just as her grandfather had drawn, was a fissure no wider than her hand. This was it. The entrance to the Crystal City.\n\nTaking a deep breath, she reached into the darkness."
                }]
            }
        }]
    }

    # --- Setup Routes ---
    page.route("**/api/proxy", lambda route: route.fulfill(status=200, json=mock_brainstorm_response))
    page.on("dialog", lambda dialog: dialog.accept())

    # --- 1. Brainstorm ---
    page.locator("#main-prompt").fill("A lost city of crystals")

    with page.expect_response("**/api/proxy"):
        page.locator("#generate-button").click()

    # Verify brainstorm cards are rendered
    expect(page.locator(".brainstorm-card", has_text="The Crystal City")).to_be_visible()
    expect(page.locator(".brainstorm-card", has_text="Star-Sailor's Echo")).to_be_visible()
    expect(page.locator(".brainstorm-card", has_text="The Gilded Cage")).to_be_visible()
    expect(page.locator("#brainstorm-response-area")).not_to_contain_text("AIME is brainstorming")

    # --- 2. Outline ---
    # Update route for the next API call
    page.unroute("**/api/proxy")
    page.route("**/api/proxy", lambda route: route.fulfill(status=200, json=mock_outline_response))

    # Click "Develop Outline" on the first card
    with page.expect_response("**/api/proxy"):
        page.locator(".brainstorm-card", has_text="The Crystal City").locator(".develop-outline-btn").click()

    # Verify tab switch and outline rendering
    expect(page.locator("#outline-tab")).to_be_visible()
    expect(page.locator(".writer-nav-button[data-tab='outline']")).to_have_class(re.compile(r"\bactive\b"))
    expect(page.locator(".outline-item", has_text="The Discovery")).to_be_visible()
    expect(page.locator(".outline-item", has_text="The First Contact")).to_be_visible()
    expect(page.locator(".outline-item", has_text="The Inevitable Threat")).to_be_visible()

    # --- 3. Draft ---
    # Update route for the final API call
    page.unroute("**/api/proxy")
    page.route("**/api/proxy", lambda route: route.fulfill(status=200, json=mock_draft_response))

    # Click "Create Treatment"
    with page.expect_response("**/api/proxy"):
        page.locator("#create-treatment-from-outline-btn").click()

    # Verify tab switch and draft content
    expect(page.locator("#treatment-tab")).to_be_visible()
    expect(page.locator(".writer-nav-button[data-tab='treatment']")).to_have_class(re.compile(r"\bactive\b"))
    expect(page.locator("#treatment-canvas")).to_contain_text("The entrance to the Crystal City.")
    expect(page.locator("#treatment-canvas")).not_to_contain_text("AIME is crafting your treatment")

def test_save_and_load_functionality(page: Page):
    """
    Tests that the save and load functions work correctly for each stage.
    """
    page.goto(BASE_URL)

    # --- 1. Test Save/Load Brainstorm ---
    # Create content to save
    page.locator("#brainstorm-response-area").evaluate("""
        () => {
            const card = document.createElement('div');
            card.className = 'brainstorm-card glass-panel';
            card.innerHTML = `
                <h4 class="card-title editable-content" contenteditable="true">Test Title</h4>
                <p class="brainstorm-logline editable-content" contenteditable="true">Test Logline</p>
                <p class="brainstorm-concept editable-content" contenteditable="true">Test Concept</p>
            `;
            document.getElementById('brainstorm-response-area').innerHTML = ''; // Clear placeholder
            document.getElementById('brainstorm-response-area').appendChild(card);
        }
    """)

    # Listen for the download
    with page.expect_download() as download_info:
        page.locator("#save-button").click()
    download = download_info.value
    brainstorm_content = download.path().read_text()

    # Verify downloaded content
    assert "## Test Title" in brainstorm_content
    assert "**Logline:** Test Logline" in brainstorm_content

    # Clear the area and load the file
    page.locator("#brainstorm-response-area").evaluate("() => document.getElementById('brainstorm-response-area').innerHTML = ''")
    expect(page.locator(".brainstorm-card")).not_to_be_visible()

    page.locator("#load-button").click()
    page.locator('input[type="file"]').set_input_files(download.path())

    # Verify content is loaded back
    page.wait_for_selector(".brainstorm-card")
    expect(page.locator(".brainstorm-card", has_text="Test Title")).to_be_visible()
    expect(page.locator(".brainstorm-card", has_text="Test Logline")).to_be_visible()

def test_new_button_functionality(page: Page):
    """
    Tests that the 'New' button clears the workspace.
    """
    page.goto(BASE_URL)

    # 1. Add content to the workspace
    # Prompt
    page.locator("#main-prompt").fill("Some test prompt")
    # Gems
    page.locator(".accordion-header", has_text="Guidance").click()
    page.locator(".gem-category-button", has_text="Genre").click()
    page.locator(".gem-modal-option-button", has_text="Fantasy").click()
    page.locator("#gem-modal-save-btn").click()
    # Asset
    page.locator("#asset-upload").set_input_files([{"name": "test.txt", "mimeType": "text/plain", "buffer": b"test"}])
    # Brainstorm content
    page.locator("#brainstorm-response-area").evaluate("""
        () => {
             document.getElementById('brainstorm-response-area').innerHTML = '<div class="brainstorm-card">Generated Content</div>';
        }
    """)

    # 2. Verify content exists
    expect(page.locator("#main-prompt")).to_have_value("Some test prompt")
    expect(page.locator(".gem-selected-pill", has_text="Fantasy")).to_be_visible()
    expect(page.locator(".asset-item", has_text="test.txt")).to_be_visible()
    expect(page.locator(".brainstorm-card")).to_be_visible()

    # 3. Click the "New" button
    page.locator("#new-button").click()

    # 4. Verify everything is cleared
    expect(page.locator("#main-prompt")).to_have_value("")
    expect(page.locator(".gem-selected-pill")).not_to_be_visible()
    expect(page.locator(".asset-item")).not_to_be_visible()
    expect(page.locator(".brainstorm-card")).not_to_be_visible()
    expect(page.locator("#brainstorm-response-area")).to_contain_text("Enter a core idea")

# --- Main execution block ---
# This allows the script to be run directly for debugging
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500) # Run in headful mode for observation
        page = browser.new_page()

        # Start a local server to serve the files
        # This requires `pip install pytest-xprocess`
        # In a real CI/CD, this would be handled by the test runner
        # For local debugging, you should run `python3 -m http.server 5001` in your terminal

        print("--- Running test_initial_ui_and_state ---")
        test_initial_ui_and_state(page)
        print("✅ Passed")

        print("\n--- Running test_guidance_gems_functionality ---")
        test_guidance_gems_functionality(page)
        print("✅ Passed")

        print("\n--- Running test_asset_hub_functionality ---")
        test_asset_hub_functionality(page)
        print("✅ Passed")

        print("\n--- Running test_full_ai_workflow_e2e ---")
        test_full_ai_workflow_e2e(page)
        print("✅ Passed")

        print("\n--- Running test_save_and_load_functionality ---")
        test_save_and_load_functionality(page)
        print("✅ Passed")

        print("\n--- Running test_new_button_functionality ---")
        test_new_button_functionality(page)
        print("✅ Passed")

        print("\n🎉 All tests passed!")
        browser.close()