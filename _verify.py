import json, sys, time
from playwright.sync_api import sync_playwright

URL = "https://econature7-lab.github.io/nori-apps/saju/"
OUT = "downloads/nori-apps-saju"
report = {"console": [], "pageerrors": [], "checks": {}}

def hook(page, tag):
    page.on("console", lambda m: report["console"].append({"vp": tag, "type": m.type, "text": m.text}))
    page.on("pageerror", lambda e: report["pageerrors"].append({"vp": tag, "err": str(e)}))

with sync_playwright() as p:
    b = p.chromium.launch()

    # ── 모바일 390×844 ─────────────────────────────
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                        is_mobile=True, has_touch=True, locale="ko-KR", timezone_id="Asia/Seoul")
    pg = ctx.new_page(); hook(pg, "mobile")
    pg.goto(URL, wait_until="networkidle")
    pg.wait_for_timeout(800)

    def overflow():
        return pg.evaluate("""() => {
            const d=document.documentElement, b=document.body;
            const over=[...document.querySelectorAll('*')].filter(el=>{
              const r=el.getBoundingClientRect();
              return r.width>1 && (r.right>d.clientWidth+1.5 || r.left<-1.5);
            }).slice(0,8).map(el=>el.tagName+'.'+(el.className||'')+' '+Math.round(el.getBoundingClientRect().left)+'..'+Math.round(el.getBoundingClientRect().right));
            return {docW:d.clientWidth, scrollW:d.scrollWidth, bodyScrollW:b.scrollWidth, offenders:over};
        }""")

    report["checks"]["mobile_overflow_top"] = overflow()
    report["checks"]["mobile_palette"] = pg.evaluate("""() => {
        const cs=getComputedStyle(document.body);
        const btn=document.querySelector('#sGo');
        const tab=document.querySelector('.apptab[aria-selected="true"]');
        return {bodyBg:cs.backgroundColor, bodyColor:cs.color,
                ctaBg:getComputedStyle(btn).backgroundImage, ctaColor:getComputedStyle(btn).color,
                tabBg:getComputedStyle(tab).backgroundImage, tabColor:getComputedStyle(tab).color,
                themeColor:document.querySelector('meta[name=theme-color]').content,
                h1:getComputedStyle(document.querySelector('.hero h1')).color};
    }""")
    pg.screenshot(path=f"{OUT}/mobile-orange-top.png")

    # ── 사주 결과 ───────────────────────────────
    pg.fill("#sName", "지연")
    pg.select_option("#sYear", "1973")
    pg.select_option("#sMonth", "6")
    pg.select_option("#sDay", "4")
    pg.select_option("#sTime", "6")
    pg.click("#sGo")
    pg.wait_for_selector("#viewResult", state="visible", timeout=8000)
    pg.wait_for_timeout(900)
    report["checks"]["saju_result"] = pg.evaluate("""() => ({
        who: document.querySelector('#resWho').textContent,
        title: document.querySelector('#resTitle').textContent,
        sub: document.querySelector('#resSub').textContent.slice(0,60),
        badges: [...document.querySelectorAll('#resBadges .chip')].map(e=>e.textContent),
        charName: document.querySelector('#sajuChar .cc-name') ? document.querySelector('#sajuChar .cc-name').textContent : null,
        bars: [...document.querySelectorAll('#elemBars .eb')].map(e=>e.textContent.trim()),
        chartCols: document.querySelectorAll('#chart .pcol').length,
        gua: document.querySelector('#guaNo').textContent,
        lucky: document.querySelector('#lucky').textContent.trim().slice(0,80),
        ccBorder: getComputedStyle(document.querySelector('#sajuChar')).borderTopWidth + ' ' + getComputedStyle(document.querySelector('#sajuChar')).borderTopColor,
        ccBg: getComputedStyle(document.querySelector('#sajuChar')).backgroundImage,
    })""")
    report["checks"]["mobile_overflow_result"] = overflow()
    pg.screenshot(path=f"{OUT}/mobile-orange-result.png")

    # ── 토정비결 탭 6개 ─────────────────────────
    tabres = []
    for tid in ["tab-sum","tab-money","tab-love","tab-work","tab-health","tab-year"]:
        pg.click("#"+tid)
        pg.wait_for_timeout(220)
        tabres.append(pg.evaluate("(id)=>{const t=document.getElementById(id);const sel=t.getAttribute('aria-selected');const panel=document.getElementById(t.getAttribute('aria-controls'));return {id,sel,visible:!panel.hidden,len:panel.textContent.trim().length};}", tid))
    report["checks"]["saju_tabs"] = tabres

    # ── 복사 ────────────────────────────────────
    pg.click("#copyBtn"); pg.wait_for_timeout(500)
    report["checks"]["copy_toast"] = pg.evaluate("() => ({show:document.querySelector('#toast').classList.contains('show'), text:document.querySelector('#toast').textContent})")

    # ── 저장 체크 → 오늘의 운세 ─────────────────
    pg.click("#againBtn"); pg.wait_for_timeout(400)
    pg.check("#sSave")
    pg.click("#sGo"); pg.wait_for_selector("#viewResult", state="visible")
    pg.click("#navToday"); pg.wait_for_timeout(500)
    report["checks"]["saved_chip"] = pg.evaluate("() => ({hidden:document.querySelector('#todaySaved').hidden, line:document.querySelector('#todaySavedText').textContent})")
    pg.fill("#tName", "지연")
    pg.select_option("#tYear","1973"); pg.select_option("#tMonth","6"); pg.select_option("#tDay","4"); pg.select_option("#tTime","6")
    pg.click("#tGo") if pg.query_selector("#tGo") else pg.click("#todayForm button[type=submit]")
    pg.wait_for_selector("#todayResult", state="visible", timeout=8000)
    pg.wait_for_timeout(700)
    report["checks"]["today_result"] = pg.evaluate("""() => ({
        who: document.querySelector('#tResWho').textContent,
        date: document.querySelector('#tResDate').textContent,
        total: document.querySelector('#tTotal').textContent,
        grade: document.querySelector('#tGradeLabel').textContent,
        doms: [...document.querySelectorAll('.dom')].map(e=>e.textContent.trim().slice(0,60)),
        lucky: document.querySelector('#tLuckyColor') ? document.querySelector('#tLuckyColor').textContent : null
    })""")
    report["checks"]["mobile_overflow_today"] = overflow()

    # ── 궁합 ────────────────────────────────────
    pg.click("#navCompat"); pg.wait_for_timeout(400)
    pg.fill("#aName","지연"); pg.select_option("#aYear","1973"); pg.select_option("#aMonth","6"); pg.select_option("#aDay","4")
    pg.fill("#bName","한스"); pg.select_option("#bYear","1972"); pg.select_option("#bMonth","8"); pg.select_option("#bDay","20")
    pg.click("#cTypeSeg button[data-type=lover]"); pg.wait_for_timeout(150)
    pg.click("#compatGo")
    pg.wait_for_selector("#compatResult", state="visible", timeout=8000)
    pg.wait_for_timeout(800)
    report["checks"]["compat_result"] = pg.evaluate("""() => ({
        names:[document.querySelector('#cNameA').textContent, document.querySelector('#cHeart').textContent, document.querySelector('#cNameB').textContent],
        score: document.querySelector('#cScore').textContent,
        band: document.querySelector('#cBand').textContent,
        summary: document.querySelector('#cSummary').textContent,
        duo: document.querySelector('#cDuo').textContent.trim().slice(0,60),
        good: document.querySelector('#cGood').textContent.trim().slice(0,60),
        basis: document.querySelector('#cBasis').textContent.trim().slice(0,80),
        scoreBg: getComputedStyle(document.querySelector('#cScore')).backgroundImage,
    })""")
    report["checks"]["mobile_overflow_compat"] = overflow()
    pg.screenshot(path=f"{OUT}/mobile-orange-compat.png")

    # 궁합 복사 + 다시 보기
    pg.click("#cCopyBtn"); pg.wait_for_timeout(400)
    report["checks"]["compat_copy_toast"] = pg.evaluate("() => document.querySelector('#toast').textContent")
    pg.click("#cAgainBtn"); pg.wait_for_timeout(400)
    report["checks"]["compat_back_form"] = pg.evaluate("() => document.querySelector('#compatForm').hidden === false && document.querySelector('#compatResult').hidden === true")

    # 개인정보 모달
    pg.click("#openPrivacy"); pg.wait_for_timeout(400)
    report["checks"]["privacy_modal"] = pg.evaluate("() => ({show:document.querySelector('#privacyModal').classList.contains('show'), title:document.querySelector('#pTitle').textContent})")
    pg.click(".sheet-close"); pg.wait_for_timeout(300)
    report["checks"]["privacy_modal_closed"] = pg.evaluate("() => !document.querySelector('#privacyModal').classList.contains('show')")
    ctx.close()

    # ── 데스크톱 1440×900 ────────────────────────
    ctx2 = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1, locale="ko-KR", timezone_id="Asia/Seoul")
    pg2 = ctx2.new_page(); hook(pg2, "desktop")
    pg2.goto(URL, wait_until="networkidle"); pg2.wait_for_timeout(700)
    report["checks"]["desktop_overflow_top"] = pg2.evaluate("""() => ({docW:document.documentElement.clientWidth, scrollW:document.documentElement.scrollWidth})""")
    pg2.fill("#sName","지연")
    pg2.select_option("#sYear","1973"); pg2.select_option("#sMonth","6"); pg2.select_option("#sDay","4"); pg2.select_option("#sTime","6")
    pg2.click("#sGo"); pg2.wait_for_selector("#viewResult", state="visible", timeout=8000); pg2.wait_for_timeout(800)
    report["checks"]["desktop_overflow_result"] = pg2.evaluate("""() => {
        const d=document.documentElement;
        const over=[...document.querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();return r.width>1 && (r.right>d.clientWidth+1.5||r.left<-1.5);}).slice(0,5).map(el=>el.tagName+'.'+el.className);
        return {docW:d.clientWidth, scrollW:d.scrollWidth, offenders:over, wrapW:Math.round(document.querySelector('#main').getBoundingClientRect().width)};
    }""")
    pg2.screenshot(path=f"{OUT}/desktop-orange-result.png")
    ctx2.close()

    # ── 허브 ────────────────────────────────────
    ctx3 = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, locale="ko-KR")
    pg3 = ctx3.new_page(); hook(pg3, "hub")
    pg3.goto("https://econature7-lab.github.io/nori-apps/", wait_until="networkidle"); pg3.wait_for_timeout(500)
    report["checks"]["hub_card"] = pg3.evaluate("""() => {
        const c=document.querySelector('a.card.hot');const cs=getComputedStyle(c);
        const nu=c.querySelector('.num .new');
        return {text:c.querySelector('h2').textContent, bg:cs.backgroundImage, border:cs.borderTopColor,
                newBadge:{color:getComputedStyle(nu).color, bg:getComputedStyle(nu).backgroundColor},
                href:c.getAttribute('href'), scrollW:document.documentElement.scrollWidth, docW:document.documentElement.clientWidth};
    }""")
    pg3.screenshot(path=f"{OUT}/hub-orange.png", full_page=True)
    ctx3.close()
    b.close()

errs = [c for c in report["console"] if c["type"] in ("error","warning")]
print(json.dumps({"pageerrors": report["pageerrors"], "console_issues": errs, "console_count": len(report["console"])}, ensure_ascii=False, indent=1))
print("=====CHECKS=====")
print(json.dumps(report["checks"], ensure_ascii=False, indent=1))
