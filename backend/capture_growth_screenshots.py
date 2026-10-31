import asyncio
import os
import shutil
from playwright.async_api import async_playwright

SCREENSHOT_DIR_BACKEND = os.path.abspath(r"d:\Company\Website\GrowthEngine2\growthengine\backend\app\static\screenshots")
SCREENSHOT_DIR_FRONTEND = os.path.abspath(r"d:\Company\Website\GrowthEngine2\growthengine\frontend\public\screenshots")
SCREENSHOT_DIR_SUB = os.path.join(SCREENSHOT_DIR_BACKEND, "growthengine")

ROUTES = [
    ("/admin/dashboard", "growth_dashboard.png"),
    ("/admin/ideas", "growth_social_ideas.png"),
    ("/admin/calendar", "growth_calendar.png"),
    ("/admin/campaigns", "growth_campaigns.png"),
    ("/admin/leads", "growth_leads.png"),
    ("/admin/inbox", "growth_inbox.png"),
    ("/admin/video", "growth_video_studio.png"),
    ("/admin/seo", "growth_seo_manager.png"),
    ("/admin/connections", "growth_connections.png"),
    ("/admin/settings", "growth_settings.png"),
    ("/admin/launch", "growth_launch.png"),
]

BASE_URL = "http://localhost:3000"

async def capture_all():
    os.makedirs(SCREENSHOT_DIR_BACKEND, exist_ok=True)
    os.makedirs(SCREENSHOT_DIR_FRONTEND, exist_ok=True)
    os.makedirs(SCREENSHOT_DIR_SUB, exist_ok=True)
    
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    exec_path = chrome_path if os.path.exists(chrome_path) else edge_path

    print(f"Using browser executable: {exec_path}")
    print(f"Targeting server: {BASE_URL}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=exec_path,
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,  # crisp 2x retina
        )

        # Set session cookie so Next.js middleware allows /admin/* routes
        await context.add_cookies([{
            "name": "gr_auth",
            "value": "auth_token_growth_admin_2026_super_session",
            "domain": "localhost",
            "path": "/"
        }])

        page = await context.new_page()

        # Set localStorage for user details
        await page.add_init_script("""
            localStorage.setItem('gr_access_token', 'mock_jwt_token_growth_admin_2026');
            localStorage.setItem('gr_user', JSON.stringify({
                id: 'usr-1',
                email: 'kishoretest2@gmail.com',
                full_name: 'Kishore Growth',
                role: 'founder'
            }));
        """)

        # First visit dashboard to initialize state and localStorage
        print("Initializing session on dashboard...")
        await page.goto(f"{BASE_URL}/admin/dashboard", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        captured_files = []
        for route, filename in ROUTES:
            target_url = f"{BASE_URL}{route}"
            print(f"Capturing {target_url} -> {filename} ...")
            try:
                await page.goto(target_url, wait_until="networkidle", timeout=25000)
            except Exception:
                await page.goto(target_url, wait_until="domcontentloaded", timeout=25000)

            # Wait for content, charts, and tables to render fully
            await page.wait_for_timeout(3000)

            backend_file = os.path.join(SCREENSHOT_DIR_BACKEND, filename)
            frontend_file = os.path.join(SCREENSHOT_DIR_FRONTEND, filename)
            sub_file = os.path.join(SCREENSHOT_DIR_SUB, filename)

            await page.screenshot(path=backend_file, full_page=False)
            shutil.copy2(backend_file, frontend_file)
            shutil.copy2(backend_file, sub_file)
            size = os.path.getsize(backend_file)
            print(f"  [OK] Saved {filename} ({size} bytes)")
            captured_files.append((route, filename))

        await browser.close()
        print(f"\nSuccessfully captured and replaced all {len(captured_files)} admin route screenshots with populated data!")

if __name__ == "__main__":
    asyncio.run(capture_all())
