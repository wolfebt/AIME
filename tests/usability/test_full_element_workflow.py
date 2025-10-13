import os
import json
from playwright.sync_api import sync_playwright, expect

# This inventory was created by analyzing the HTML and JS files.
# It now includes tab structures to handle testing of tabbed interfaces.
ELEMENT_INVENTORY = {
    "faction": {
        "type": "FACTION",
        "tabs": {
            "identity": ["faction-name", "faction-type", "faction-mandate", "faction-slogan", "faction-reputation"],
            "ideology": ["faction-ideology", "faction-alignment", "faction-short-term", "faction-long-term", "faction-agenda"],
            "structure": ["faction-leadership", "faction-org-structure", "faction-ranks", "faction-code", "faction-symbols"],
            "resources": ["faction-territory", "faction-assets", "faction-military", "faction-political"],
            "relations": ["faction-allies", "faction-enemies", "faction-gov-relations", "faction-recruitment"]
        },
        "gems": ["Faction Type", "Organizational Model", "Public Face", "Method of Influence", "Moral Alignment"],
        "untabbed_fields": ["custom-notes"]
    },
    "persona": {
        "type": "PERSONA",
        "tabs": {
            "overview": ["persona-name", "persona-role", "persona-archetype", "persona-summary", "persona-motivation", "persona-goal"],
            "profile": [],
            "backstory": [],
            "psychology": [],
            "genre": [],
            "notes": ["custom-notes"]
        },
        "sub_tabs": {
            "profile": {
                "vitals": ["profile-fullname", "profile-aliases", "profile-age", "profile-gender", "profile-occupation", "profile-status", "profile-residence", "profile-origin"],
                "physicality": ["profile-description", "profile-voice", "profile-style", "profile-mannerisms"],
                "personality": ["profile-positive-traits", "profile-negative-traits", "profile-likes", "profile-dislikes", "profile-hobbies", "profile-personality-type"]
            },
            "backstory": {
                "history": ["backstory-summary", "backstory-childhood", "backstory-adolescence", "backstory-adulthood", "backstory-trauma", "backstory-accomplishments"],
                "relationships": ["backstory-relationships"]
            },
            "psychology": {
                "makeup": ["psychology-worldview", "psychology-morals", "psychology-lie", "psychology-truth", "psychology-fear", "psychology-secret", "psychology-perception"],
                "arc": ["psychology-external-goal", "psychology-internal-goal", "psychology-arc-summary", "psychology-stakes"]
            },
            "genre": {
                "fantasy": ["genre-species", "genre-faction", "genre-abilities", "genre-items", "genre-homeworld"],
                "mystery": ["genre-connection", "genre-motive", "genre-alibi", "genre-secrets"],
                "romance": ["genre-history", "genre-love-view", "genre-love-language", "genre-partner-traits"]
            }
        },
        "gems": ["Descriptive Tone", "Character Complexity", "Speech Pattern", "Physicality Focus", "Inner World Focus"],
        "untabbed_fields": []
    },
    "philosophy": {
        "type": "PHILOSOPHY",
        "tabs": {
            "core-beliefs": ["philosophy-name", "philosophy-origin", "philosophy-tenets", "philosophy-cosmology", "philosophy-ethics", "philosophy-texts"],
            "practices-structure": ["philosophy-rituals", "philosophy-worship", "philosophy-places", "philosophy-symbols", "philosophy-structure"],
            "influence": ["philosophy-relations", "philosophy-societal-influence", "philosophy-political-influence", "philosophy-adherence"]
        },
        "gems": ["Organizational Structure", "Public Perception", "Dominant Tone", "Historical Influence"],
        "untabbed_fields": ["custom-notes"]
    },
    "scene": {
        "type": "SCENE",
        "tabs": {
            "core-details": ["scene-name", "scene-location", "scene-time", "scene-mood"],
            "sensory-details": ["scene-sight", "scene-sound", "scene-smell"],
            "narrative-elements": ["scene-characters", "scene-objective", "scene-conflict", "scene-beats", "scene-objects"]
        },
        "gems": ["Primary Mood", "Sensory Focus", "Narrative Pacing", "Dialogue Style", "Point of View"],
        "untabbed_fields": ["custom-notes"]
    },
    "setting": {
        "type": "SETTING",
        "tabs": {
            "core-identity": ["setting-name", "parent-world", "setting-purpose"],
            "environment": ["setting-geography", "setting-landmarks", "setting-architecture", "setting-flora-fauna", "setting-population"],
            "culture": ["setting-culture", "setting-government", "setting-economy", "setting-history", "setting-atmosphere"]
        },
        "gems": ["Location Type", "Architectural Style", "General Atmosphere", "Population Density", "State of Repair"],
        "untabbed_fields": ["custom-notes"]
    },
    "species": {
        "type": "SPECIES",
        "tabs": {
            "core-identity": ["species-name", "species-classification", "species-origin"],
            "biology": ["species-anatomy", "species-biology", "species-senses", "species-abilities", "species-communication", "species-vulnerabilities"],
            "behavior": ["species-behavior", "species-diet", "species-habitat", "species-evolution"],
            "culture": ["species-culture", "species-role", "species-relations"]
        },
        "gems": ["Origin Type", "Role in World", "Societal Model", "Technological Aptitude", "General Temperament"],
        "untabbed_fields": ["custom-notes"]
    },
    "technology": {
        "type": "TECHNOLOGY",
        "tabs": {
            "core-concept": ["tech-name", "tech-category", "tech-level", "tech-purpose"],
            "design-operation": ["tech-aesthetics", "tech-mechanism", "tech-power", "tech-materials", "tech-drawbacks", "tech-vulnerabilities"],
            "societal-impact": ["tech-social-impact", "tech-eco-impact", "tech-history", "tech-proliferation"]
        },
        "gems": ["Aesthetic Style", "Descriptive Style", "Perceived Reliability", "User-Friendliness"],
        "untabbed_fields": ["custom-notes"]
    },
    "universe": {
        "type": "UNIVERSE",
        "tabs": {
            "core-concept": ["universe-name", "primary-genre", "themes-motifs", "high-concept-pitch", "inspirations-tone"],
            "rules-of-reality": ["laws-physics", "universal-constants", "ftl-travel", "exotic-matter"],
            "metaphysical-rules": ["soul-consciousness", "time-causality", "destiny-prophecy"],
            "source-of-power": ["power-origin", "power-access"],
            "cosmology": ["cosmology-scale", "cosmology-planes", "cosmology-phenomena"]
        },
        "gems": ["Core Genre", "Genre Blends", "Dominant Tone", "Cosmic Scope", "Magic/Power System", "Technological Era"],
        "untabbed_fields": ["custom-notes"]
    },
    "world": {
        "type": "WORLD",
        "tabs": {
            "cosmology": ["world-name", "world-premise", "world-cosmology", "world-physics", "magic-source", "magic-rules", "magic-impact"],
            "physical": ["physical-stars", "physical-stats", "physical-moons", "physical-geography", "physical-weather"],
            "history": ["history-creation", "history-ages", "history-events", "history-empires", "history-prophecies"],
            "inhabitants": ["life-origin", "life-species", "life-factions", "life-demographics", "life-monsters"],
            "systems": ["systems-tech", "systems-economy", "systems-languages", "systems-calendar", "systems-relations"],
            "metaphysics": ["meta-gods", "meta-afterlife", "meta-planes", "meta-beings"],
            "themes": ["themes-central", "themes-tone", "themes-inspirations", "custom-notes"]
        },
        "gems": [],
        "untabbed_fields": []
    }
}


def run_test(playwright):
    script_dir = os.path.dirname(__file__)
    txt_asset_path = os.path.abspath(os.path.join(script_dir, "test_asset.txt"))
    world_asset_path = os.path.abspath(os.path.join(script_dir, "test_world.world"))
    prompts_dir = os.path.abspath(os.path.join(script_dir, "generated_prompts"))
    os.makedirs(prompts_dir, exist_ok=True)

    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.set_default_timeout(10000)

    intercepted_prompts = {}

    def handle_route(route):
        request = route.request
        try:
            payload = request.post_data_json
            prompt_text = payload.get("contents", [{}])[0].get("parts", [{}])[0].get("text", "")

            element_type = "UNKNOWN"
            for key, value in ELEMENT_INVENTORY.items():
                if f'"{value["type"]}"' in prompt_text:
                    element_type = value["type"]
                    break

            intercepted_prompts[element_type] = prompt_text

            prompt_filename = os.path.join(prompts_dir, f"{element_type}_prompt.txt")
            with open(prompt_filename, "w", encoding="utf-8") as f:
                f.write(prompt_text)
            print(f"Saved prompt for {element_type} to {prompt_filename}")

            route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                json={"candidates": [{"content": {"parts": [{"text": f"Mock response for {element_type}"}]}}]}
            )
        except Exception as e:
            print(f"Error handling route: {e}")
            route.abort()

    page.route("**/models/*:generateContent*", handle_route)

    # Set up the dialog handler once, outside the loop.
    page.on("dialog", lambda dialog: dialog.accept())

    for name, details in ELEMENT_INVENTORY.items():
        print(f"--- Testing Element: {name.capitalize()} ---")
        server_url = f"http://127.0.0.1:5001/pages/{name}.html"
        try:
            page.goto(server_url, timeout=30000)
            print(f"Successfully navigated to {server_url}")

            def fill_field(page, field_id):
                """Helper function to fill a field, handling the edit toggle for custom-notes."""
                try:
                    target_field = page.locator(f"#{field_id}")
                    target_field.scroll_into_view_if_needed(timeout=5000)

                    if field_id == "custom-notes":
                        edit_toggle_label = page.locator(f"label.edit-toggle-switch:has(input[data-target='{field_id}'])")
                        if edit_toggle_label.count() > 0:
                            edit_toggle_label.scroll_into_view_if_needed(timeout=5000)
                            edit_toggle_label.click(timeout=2000)
                            print(f"Clicked edit toggle for {field_id}")
                        else:
                             print(f"Warning: Could not find edit toggle for {field_id}")

                    target_field.fill(f"Test content for {field_id}", timeout=5000)
                except Exception as e:
                    print(f"    -> Error filling field '{field_id}': {e}")

            print("Filling input fields...")
            # Process all fields defined in tabs
            if "tabs" in details:
                for tab_name, field_ids in details["tabs"].items():
                    try:
                        tab_button = page.locator(f".element-nav-button[data-tab='{tab_name}']")
                        if tab_button.count() > 0:
                            tab_button.click(timeout=5000)
                            print(f"Clicked tab: {tab_name}")

                        for field_id in field_ids:
                            fill_field(page, field_id)

                        if "sub_tabs" in details and tab_name in details["sub_tabs"]:
                            for sub_tab_name, sub_field_ids in details["sub_tabs"][tab_name].items():
                                try:
                                    sub_tab_button = page.locator(f".sub-nav-button[data-sub-tab='{sub_tab_name}']")
                                    sub_tab_button.click(timeout=5000)
                                    print(f"  Clicked sub-tab: {sub_tab_name}")
                                    for field_id in sub_field_ids:
                                        fill_field(page, field_id)
                                except Exception as e:
                                    print(f"  Could not process sub-tab '{sub_tab_name}' in tab '{tab_name}': {e}")
                    except Exception as e:
                        print(f"Warning: Could not process tab '{tab_name}' on page '{name}': {e}")

            # Process all untabbed fields
            for field_id in details.get("untabbed_fields", []):
                 fill_field(page, field_id)

            # 2. Select the first gem from each category
            print("Selecting guidance gems...")
            guidance_accordion = page.get_by_role("button", name="Guidance")
            if guidance_accordion.count() > 0:
                guidance_accordion.click()
                for gem_category in details["gems"]:
                    try:
                        page.get_by_role("button", name=gem_category, exact=True).click(timeout=5000)
                        page.locator("#gem-modal-options-container button").first.click(timeout=5000)
                        page.locator("#gem-modal-save-btn").click(timeout=5000)
                    except Exception as e:
                         print(f"Could not select gem for '{gem_category}' on page '{name}': {e}")

            # 3. Upload assets
            print("Uploading assets...")
            asset_importer = page.locator("#import-asset-btn")
            if asset_importer.count() > 0:
                with page.expect_file_chooser(timeout=5000) as fc_info:
                    asset_importer.click()
                file_chooser = fc_info.value
                file_chooser.set_files([txt_asset_path, world_asset_path])
                expect(page.locator("#asset-list").get_by_text("test_asset.txt")).to_be_visible()

            # 4. Generate and trigger interception
            print("Generating content...")
            with page.expect_response("**/models/*:generateContent*") as response_info:
                page.locator("#generate-button").click(force=True)

            response = response_info.value
            print(f"Intercepted API response with status: {response.status}")

            # 5. Take a screenshot
            print("Taking screenshot...")
            screenshot_path = os.path.abspath(os.path.join(script_dir, f"test_full_workflow_{name}.png"))
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"!!!!!!!!!! FAILED to test page: {name}. Error: {e} !!!!!!!!!!")
            failure_screenshot_path = os.path.abspath(os.path.join(script_dir, f"test_FAILURE_{name}.png"))
            page.screenshot(path=failure_screenshot_path)
            print(f"Failure screenshot saved to {failure_screenshot_path}")

    browser.close()
    print("\n--- Test complete. All prompts have been saved to the 'generated_prompts' directory. ---")


if __name__ == "__main__":
    with sync_playwright() as p:
        run_test(p)