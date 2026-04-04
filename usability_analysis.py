import asyncio
import os
import glob
from playwright.async_api import async_playwright

BASE_URL = "http://127.0.0.1:5001"
PAGES_TO_TEST = []

# Gather all HTML files
for html_file in glob.glob("**/*.html", recursive=True):
    if "node_modules" not in html_file and "venv" not in html_file and ".git" not in html_file:
        PAGES_TO_TEST.append(html_file)

VIEWPORTS = {
    "mobile": {"width": 375, "height": 812},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1440, "height": 900}
}

async def analyze_page(page, url, file_path):
    results = {
        "file": file_path,
        "console_errors": [],
        "overflow": {},
        "broken_links": [],
    }

    # Listen for console errors
    page.on("pageerror", lambda err: results["console_errors"].append(err.message))
    page.on("console", lambda msg: results["console_errors"].append(msg.text) if msg.type == "error" else None)

    for vp_name, vp_size in VIEWPORTS.items():
        await page.set_viewport_size(vp_size)
        try:
            # wait_until='commit' or 'load'
            # Using 'domcontentloaded' to avoid waiting for slow external resources like CDN
            response = await page.goto(f"{BASE_URL}/{file_path}", wait_until="domcontentloaded", timeout=10000)

            # Allow some time for rendering
            await page.wait_for_timeout(1000)

            # Check for horizontal overflow
            overflow = await page.evaluate("""() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            }""")
            results["overflow"][vp_name] = overflow

            # In desktop view, also check for links
            if vp_name == "desktop":
                links = await page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
                }""")
                for link in links:
                    if link.startswith('#') or link.startswith('mailto:') or link.startswith('http'):
                        continue # Skip these for local link check
                    # Just simple heuristic to see if local links resolve (this could be improved)

        except Exception as e:
            results["console_errors"].append(f"Failed to load/evaluate {vp_name}: {str(e)}")

    return results

async def main():
    print(f"Found {len(PAGES_TO_TEST)} pages to test.")
    report_lines = ["# AIME Usability Analysis Report\n"]
    report_lines.append("## Pages Analyzed\n")
    for p in sorted(PAGES_TO_TEST):
        report_lines.append(f"- `{p}`")
    report_lines.append("\n## Findings\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        for file_path in sorted(PAGES_TO_TEST):
            print(f"Analyzing {file_path}...")
            res = await analyze_page(page, BASE_URL, file_path)

            issues_found = False
            page_report = [f"### `{file_path}`"]

            if res["console_errors"]:
                issues_found = True
                page_report.append("- **Console Errors:**")
                for err in set(res["console_errors"]):
                    page_report.append(f"  - {err}")

            overflows = [vp for vp, has_over in res["overflow"].items() if has_over]
            if overflows:
                issues_found = True
                page_report.append(f"- **Horizontal Overflow (Layout Break):** Detected on {', '.join(overflows)}")

            if issues_found:
                report_lines.extend(page_report)
                report_lines.append("")
            else:
                report_lines.append(f"### `{file_path}`\n- No major automated issues detected.\n")

        await browser.close()

    with open("report.md", "w") as f:
        f.write("\n".join(report_lines))
    print("Report written to report.md")

if __name__ == "__main__":
    asyncio.run(main())
