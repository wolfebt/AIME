from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Construct the absolute file path
        # The test is run from the root of the repo, so we need to build the path from there.
        file_path = os.path.abspath("pages/writer.html")

        # Navigate to the local HTML file
        page.goto(f"file://{file_path}")

        # Wait for the side panels to be visible to ensure the page has loaded
        page.wait_for_selector('.side-panel-container')

        # Take a screenshot of the side column
        side_column = page.query_selector('.side-column')
        if side_column:
            side_column.screenshot(path="jules-scratch/verification/verification.png")
        else:
            page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()