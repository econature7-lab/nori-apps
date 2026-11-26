import json
from playwright.sync_api import sync_playwright

URL = "https://econature7-lab.github.io/nori-apps/saju/"
OUT = "downloads/nori-apps-saju"
info = {"console": [], "pageerrors": []}

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3,
                        is_mobile=True, has_touch=True, locale="ko-KR", timezone_id="Asia/Seoul")
    pg = ctx.new_page()
    pg.on("console", lambda m: info["console"].append({"t": m.type, "x": m.text}))
    pg.on("pageerror", lambda e: info["pageerrors"].append(str(e)))
    pg.goto(URL, wait_until="networkidle"); pg.wait_for_timeout(900)
    pg.screenshot(path=f"{OUT}/mobile-orange-top.png")

    pg.fill("#sName", "지연")
    pg.select_option("#sYear", "1973"); pg.select_option("#sMonth", "6"); pg.select_option("#sDay", "4"); pg.select_option("#sTime", "6")
    pg.click("#sGo"); pg.wait_for_selector("#viewResult", state="visible"); pg.wait_for_timeout(1000)
    pg.screenshot(path=f"{OUT}/mobile-orange-result.png")
    # 검토용: 오행·원국표 구역
    pg.evaluate("document.querySelectorAll('.card')[1].scrollIntoView({block:'start'})")
    pg.wait_for_timeout(700)
    pg.screenshot(path="downloads/nori-apps-saju/review-elem.png")
    pg.evaluate("document.querySelector('#chart').closest('.card').scrollIntoView({block:'start'})")
    pg.wait_for_timeout(600)
    pg.screenshot(path="downloads/nori-apps-saju/review-chart.png")
    pg.evaluate("document.querySelector('#guaNo').closest('.card').scrollIntoView({block:'start'})")
    pg.wait_for_timeout(600)
    pg.screenshot(path="downloads/nori-apps-saju/review-gua.png")
    # 토정비결 재물 탭
    pg.click("#tab-money"); pg.wait_for_timeout(400)
    pg.screenshot(path="downloads/nori-apps-saju/review-tab.png")
    # 하단 행운/버튼
    pg.evaluate("document.querySelector('#lucky').closest('.card').scrollIntoView({block:'start'})")
    pg.wait_for_timeout(500)
    pg.screenshot(path="downloads/nori-apps-saju/review-lucky.png")

    # 오늘의 운세
    pg.click("#navToday"); pg.wait_for_timeout(500)
    pg.fill("#tName", "지연")
    pg.select_option("#tYear","1973"); pg.select_option("#tMonth","6"); pg.select_option("#tDay","4"); pg.select_option("#tTime","6")
    pg.click("#todayForm button[type=submit]")
    pg.wait_for_selector("#todayResult", state="visible"); pg.wait_for_timeout(1000)
    pg.screenshot(path="downloads/nori-apps-saju/review-today.png")

    # 궁합
    pg.click("#navCompat"); pg.wait_for_timeout(400)
    pg.fill("#aName","지연"); pg.select_option("#aYear","1973"); pg.select_option("#aMonth","6"); pg.select_option("#aDay","4")
    pg.fill("#bName","한스"); pg.select_option("#bYear","1972"); pg.select_option("#bMonth","8"); pg.select_option("#bDay","20")
    pg.click("#compatGo"); pg.wait_for_selector("#compatResult", state="visible"); pg.wait_for_timeout(900)
    pg.screenshot(path=f"{OUT}/mobile-orange-compat.png")
    pg.evaluate("document.querySelector('#cDuo').scrollIntoView({block:'center'})")
    pg.wait_for_timeout(400)
    pg.screenshot(path="downloads/nori-apps-saju/review-compat2.png")

    # 넘침 재확인
    info["overflow"] = pg.evaluate("""() => {
      const d=document.documentElement;
      return {docW:d.clientWidth, scrollW:d.scrollWidth, over: [...document.querySelectorAll('body *')].filter(el=>{
        const r=el.getBoundingClientRect();
        return r.width>1 && r.right>d.clientWidth+1.5 && !el.closest('.tabs') && !el.classList.contains('skip');
      }).slice(0,6).map(el=>el.tagName+'.'+el.className)};
    }""")
    ctx.close()

    ctx2 = b.new_context(viewport={"width": 1440, "height": 900}, locale="ko-KR", timezone_id="Asia/Seoul")
    pg2 = ctx2.new_page()
    pg2.on("console", lambda m: info["console"].append({"t": m.type, "x": m.text}))
    pg2.on("pageerror", lambda e: info["pageerrors"].append(str(e)))
    pg2.goto(URL, wait_until="networkidle"); pg2.wait_for_timeout(700)
    pg2.fill("#sName","지연")
    pg2.select_option("#sYear","1973"); pg2.select_option("#sMonth","6"); pg2.select_option("#sDay","4"); pg2.select_option("#sTime","6")
    pg2.click("#sGo"); pg2.wait_for_selector("#viewResult", state="visible"); pg2.wait_for_timeout(900)
    pg2.screenshot(path=f"{OUT}/desktop-orange-result.png")
    pg2.evaluate("document.querySelector('#chart').closest('.card').scrollIntoView({block:'center'})")
    pg2.wait_for_timeout(500)
    pg2.screenshot(path="downloads/nori-apps-saju/review-desktop-chart.png")
    info["desktop_overflow"] = pg2.evaluate("() => ({docW:document.documentElement.clientWidth, scrollW:document.documentElement.scrollWidth})")
    ctx2.close(); b.close()

print(json.dumps(info, ensure_ascii=False, indent=1))
