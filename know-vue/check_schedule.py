from playwright.sync_api import sync_playwright
import sys

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    
    # Capture console logs
    page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
    
    print("=== Navigating to http://localhost:3000 ===")
    page.goto("http://localhost:3000", timeout=30000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    
    print(f"Current URL: {page.url}")
    print(f"Title: {page.title()}")
    
    # Screenshot the page
    page.screenshot(path="E:\\Ai-Master\\know-vue\\screenshot-home.png", full_page=True)
    
    # Check for login page
    body_text = page.inner_text("body")
    if "登录" in body_text or "login" in body_text.lower():
        print("=== Login page detected ===")
        # Try to login
        username_input = page.locator("input[placeholder*='用户'], input[placeholder*='账号'], input[name='username'], input[id*='username'], input[id*='account']").first
        password_input = page.locator("input[placeholder*='密码'], input[type='password']").first
        login_btn = page.locator("button:has-text('登录'), button:has-text('登 录'), button:has-text('sign in')").first
        
        if username_input and password_input and login_btn:
            print("Filling login form...")
            username_input.fill("admin")
            password_input.fill("admin123")
            login_btn.click()
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            print(f"After login URL: {page.url}")
            page.screenshot(path="E:\\Ai-Master\\know-vue\\screenshot-after-login.png", full_page=True)
    
    # Try to navigate to plan/schedule
    print("\n=== Navigating to plan/schedule ===")
    page.goto("http://localhost:3000/plan/schedule", timeout=15000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)
    print(f"Schedule page URL: {page.url}")
    page.screenshot(path="E:\\Ai-Master\\know-vue\\screenshot-schedule.png", full_page=True)
    
    # Look for content
    print(f"\nPage body text (first 2000 chars): {page.inner_text('body')[:2000]}")
    
    # Check for buttons
    buttons = page.locator("button").all()
    print(f"\nFound {len(buttons)} buttons:")
    for b in buttons:
        print(f"  Button: '{b.inner_text()}' visible={b.is_visible()}")
    
    # Check for tables
    tables = page.locator("table, .ant-table, .a-table").all()
    print(f"\nFound {len(tables)} tables/table elements")
    
    browser.close()
