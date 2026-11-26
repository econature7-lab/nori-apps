/* ─────────────────────────────────────────────────────────────
   app.js — 화면 조립
   ① 사주·2027 토정비결  ② 오늘의 운세  ③ 둘이 보는 궁합
   폼 생성 · 탭 전환 · 결과 렌더 · 복사 · 선택 저장(localStorage)
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var S = window.SAJU, C = window.SAJU_CONTENT, DAILY = window.SAJU_DAILY, COMPAT = window.SAJU_COMPAT;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var state = {
    view: "saju",
    gender: "F",
    cal: "solar",
    saju: null, built: null, sajuCopy: "",
    today: null, todayCopy: "",
    compat: null, compatCopy: "",
    ctype: "lover"
  };

  var HOURS = [
    ["", "시간 모름"], ["0", "자시 23:00 ~ 00:59"], ["1", "축시 01:00 ~ 02:59"],
    ["2", "인시 03:00 ~ 04:59"], ["3", "묘시 05:00 ~ 06:59"], ["4", "진시 07:00 ~ 08:59"],
    ["5", "사시 09:00 ~ 10:59"], ["6", "오시 11:00 ~ 12:59"], ["7", "미시 13:00 ~ 14:59"],
    ["8", "신시 15:00 ~ 16:59"], ["9", "유시 17:00 ~ 18:59"], ["10", "술시 19:00 ~ 20:59"],
    ["11", "해시 21:00 ~ 22:59"]
  ];

  /* ── 공통 유틸 ──────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; });
  }
  function pad(n) { return ("0" + n).slice(-2); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

  var toastT = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ── 생년월일시 폼 (4곳에서 같은 코드로 생성) ─────── */
  function buildBirth(mountId, opt) {
    opt = opt || {};
    var p = opt.prefix;
    var mount = $(mountId);
    var form = document.createElement("form");
    form.className = "form";
    form.id = p + "Form";
    form.setAttribute("novalidate", "");

    var h = [];
    if (opt.name !== false) {
      h.push('<div class="frow"><label for="' + p + 'Name">이름 <span class="opt">선택</span></label>'
        + '<input class="txt" id="' + p + 'Name" type="text" inputmode="text" autocomplete="off" maxlength="12" placeholder="' + (opt.namePlaceholder || "결과에 표시할 이름 (비워도 돼요)") + '"></div>');
    }
    if (opt.gender) {
      h.push('<div class="frow"><span class="flabel" id="' + p + 'lblG">성별</span>'
        + '<div class="seg" role="group" aria-labelledby="' + p + 'lblG">'
        + '<button type="button" data-g="F" aria-pressed="true">여성</button>'
        + '<button type="button" data-g="M" aria-pressed="false">남성</button>'
        + '<button type="button" data-g="X" aria-pressed="false">밝히지 않음</button>'
        + '</div></div>');
    }
    h.push('<div class="frow"><span class="flabel" id="' + p + 'lblC">달력</span>'
      + '<div class="seg" role="group" aria-labelledby="' + p + 'lblC">'
      + '<button type="button" data-c="solar" aria-pressed="true">양력</button>'
      + '<button type="button" data-c="lunar" aria-pressed="false">음력</button>'
      + '</div>'
      + '<div class="checkline" id="' + p + 'LeapWrap" hidden><label><input type="checkbox" id="' + p + 'Leap"> 윤달(閏月)에 태어났어요</label></div>'
      + '</div>');
    h.push('<div class="frow"><span class="flabel">생년월일</span><div class="grid3">'
      + '<div class="sel"><select id="' + p + 'Year" aria-label="태어난 해"></select></div>'
      + '<div class="sel"><select id="' + p + 'Month" aria-label="태어난 달"></select></div>'
      + '<div class="sel"><select id="' + p + 'Day" aria-label="태어난 날"></select></div>'
      + '</div><p class="hint" id="' + p + 'Hint">양력 생일이면 그대로 넣어 주세요. 음력을 고르면 음력 생일로 계산합니다.</p></div>');
    h.push('<div class="frow"><label for="' + p + 'Time">태어난 시간</label>'
      + '<div class="sel"><select id="' + p + 'Time"></select></div>'
      + '<p class="hint">모르면 ‘시간 모름’을 고르세요. 시주를 뺀 여섯 글자로 계산합니다.</p></div>');
    if (opt.save) {
      h.push('<div class="checkline" style="margin:-4px 0 14px"><label><input type="checkbox" id="' + p + 'Save"> 이 사주를 내 폰에 기억하기</label></div>'
        + '<p class="hint" style="margin:-8px 0 14px">체크하면 다음에 ‘오늘의 운세’를 한 번에 볼 수 있어요. 저장은 이 브라우저에만 됩니다.</p>');
    }
    h.push('<p class="err" id="' + p + 'Err" role="alert"></p>');
    if (opt.submit) h.push('<button class="btn btn-gold" type="submit" id="' + p + 'Go">' + opt.submit + '</button>');
    if (opt.privacy) {
      h.push('<p class="privacy-note"><span aria-hidden="true">🔒</span><span>입력하신 생년월일시는 <b>서버에 전송·저장되지 않고 내 브라우저 안에서만</b> 계산됩니다. 로그인도 없어요.</span></p>');
    }
    form.innerHTML = h.join("");
    mount.appendChild(form);

    var yr = form.querySelector("#" + p + "Year"),
      mo = form.querySelector("#" + p + "Month"),
      dy = form.querySelector("#" + p + "Day"),
      tm = form.querySelector("#" + p + "Time"),
      leap = form.querySelector("#" + p + "Leap"),
      leapWrap = form.querySelector("#" + p + "LeapWrap"),
      hint = form.querySelector("#" + p + "Hint"),
      err = form.querySelector("#" + p + "Err"),
      nameEl = form.querySelector("#" + p + "Name"),
      saveEl = form.querySelector("#" + p + "Save");

    for (var y = 2026; y >= 1940; y--) yr.add(new Option(y + "년", y));
    for (var m = 1; m <= 12; m++) mo.add(new Option(m + "월", m));
    HOURS.forEach(function (x) { tm.add(new Option(x[1], x[0])); });

    var cal = "solar", gender = "F";
    function daysInMonth(yy, mm) { return new Date(yy, mm, 0).getDate(); }
    function refreshDays() {
      var yy = +yr.value, mm = +mo.value, prev = +dy.value || 1;
      var max = cal === "lunar" ? (S.lunarMonthLength(yy, mm) || 30) : daysInMonth(yy, mm);
      dy.innerHTML = "";
      for (var d = 1; d <= max; d++) dy.add(new Option(d + "일", d));
      dy.value = Math.min(prev, max);
    }
    function refreshLeap() {
      if (cal !== "lunar") { leapWrap.hidden = true; leap.checked = false; return; }
      leapWrap.hidden = false;
      var hasLeap = S.lunarToSolar(+yr.value, +mo.value, true, 1) !== null;
      leap.disabled = !hasLeap;
      if (!hasLeap) leap.checked = false;
      leap.parentNode.style.opacity = hasLeap ? "1" : ".45";
      leap.parentNode.setAttribute("title", hasLeap ? "" : "이 해 이 달에는 윤달이 없습니다");
    }
    function refreshAll() { refreshDays(); refreshLeap(); }

    function setPressed(list, attr, val) {
      $$(list, form).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute(attr) === val ? "true" : "false"); });
    }

    $$("[data-g]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        gender = b.getAttribute("data-g");
        setPressed("[data-g]", "data-g", gender);
      });
    });
    $$("[data-c]", form).forEach(function (b) {
      b.addEventListener("click", function () {
        cal = b.getAttribute("data-c");
        setPressed("[data-c]", "data-c", cal);
        hint.textContent = cal === "lunar"
          ? "음력 생일을 그대로 넣어 주세요. 양력으로 바꿔 사주를 세웁니다."
          : "양력 생일이면 그대로 넣어 주세요. 음력을 고르면 음력 생일로 계산합니다.";
        refreshAll();
      });
    });
    yr.addEventListener("change", refreshAll);
    mo.addEventListener("change", refreshAll);

    yr.value = (opt.defaults && opt.defaults.y) || 1990;
    mo.value = (opt.defaults && opt.defaults.m) || 5;
    refreshAll();
    dy.value = (opt.defaults && opt.defaults.d) || 15;

    function read() {
      var t = tm.value;
      return {
        name: nameEl ? nameEl.value.trim() : "",
        gender: gender,
        calendar: cal,
        leap: cal === "lunar" ? leap.checked : false,
        y: +yr.value, m: +mo.value, d: +dy.value,
        h: t === "" ? null : (t === "0" ? 23 : 2 * (+t) - 1),
        minute: 0
      };
    }
    function set(v) {
      if (!v) return;
      if (nameEl && v.name) nameEl.value = v.name;
      gender = v.gender || "F"; setPressed("[data-g]", "data-g", gender);
      cal = v.calendar || "solar"; setPressed("[data-c]", "data-c", cal);
      hint.textContent = cal === "lunar"
        ? "음력 생일을 그대로 넣어 주세요. 양력으로 바꿔 사주를 세웁니다."
        : "양력 생일이면 그대로 넣어 주세요. 음력을 고르면 음력 생일로 계산합니다.";
      yr.value = v.y; mo.value = v.m;
      refreshAll();
      dy.value = v.d;
      if (!dy.value) dy.value = dy.options[dy.options.length - 1].value;
      leap.checked = !!v.leap;
      tm.value = (v.h === null || v.h === undefined) ? "" : String(hourToIndex(v.h));
    }
    function error(msg) {
      err.textContent = msg; err.classList.add("show");
    }
    function clearError() { err.textContent = ""; err.classList.remove("show"); }

    function onSubmit(e) {
      e.preventDefault();
      clearError();
      var input = read();
      if (opt.onSubmit) opt.onSubmit(input, api);
    }
    form.addEventListener("submit", onSubmit);

    var api = {
      form: form, prefix: p, read: read, set: set, error: error, clearError: clearError,
      nameEl: nameEl, saveEl: saveEl, timeEl: tm,
      refresh: refreshAll,
      getInput: read
    };

    if (saveEl) {
      saveEl.addEventListener("change", function () {
        var rec = read();
        if (saveEl.checked) {
          writeSaved(rec);
          toast(rec.name ? rec.name + " 님 사주를 저장했어요" : "내 사주를 저장했어요");
        } else {
          clearSaved();
          toast("저장을 지웠어요");
        }
        syncSaved();
      });
    }
    return api;
  }

  function hourToIndex(h) {
    if (h === null || h === undefined) return "";
    if (h >= 23 || h === 23) return "0";
    return String(Math.floor((h + 1) / 2));
  }

  /* ── 선택 저장 (localStorage) ───────────────────── */
  var LS_KEY = "nori.saju.me.v1";

  function readSaved() {
    try {
      var raw = window.localStorage.getItem(LS_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || !o.y || !o.m || !o.d) return null;
      return o;
    } catch (e) { return null; }
  }
  function writeSaved(input) {
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify({
        v: 1, name: input.name || "", gender: input.gender || "F",
        calendar: input.calendar || "solar", leap: !!input.leap,
        y: input.y, m: input.m, d: input.d,
        h: (input.h === null || input.h === undefined) ? null : input.h
      }));
    } catch (e) { /* 저장이 막힌 브라우저면 조용히 넘어갑니다 */ }
  }
  function clearSaved() {
    try { window.localStorage.removeItem(LS_KEY); } catch (e) { }
  }
  function savedLabel(o) {
    var cal = o.calendar === "lunar" ? "음력" : "양력";
    return (o.name ? o.name : "내 사주") + " · " + cal + " " + o.y + "." + o.m + "." + o.d + (o.leap ? " (윤달)" : "");
  }
  function savedMeta(o) {
    var t = "";
    if (o.h === null || o.h === undefined) t = "태어난 시간 모름";
    else {
      var idx = hourToIndex(o.h);
      var found = HOURS.filter(function (x) { return x[0] === idx; })[0];
      t = found ? found[1] : "시간 입력됨";
    }
    return t + " · 이 브라우저에만 저장됨";
  }

  /* ── 폼 인스턴스 ────────────────────────────────── */
  var sajuBirth, todayBirth, birthA, birthB, mounted = false;

  function mountForms() {
    if (mounted) return;
    mounted = true;
    sajuBirth = buildBirth("birthSaju", {
      prefix: "s", name: true, gender: true, save: true, privacy: true,
      submit: "내 사주 뽑기 ✨", defaults: { y: 1990, m: 5, d: 15 },
      onSubmit: function (input) {
        var res = S.compute(input);
        if (res.error) { sajuBirth.error(res.error); return; }
        if (sajuBirth.saveEl && sajuBirth.saveEl.checked) writeSaved(input);
        syncSaved();
        var built = C.build(res);
        state.saju = res; state.built = built;
        renderSaju(res, built);
        $("viewForm").hidden = true;
        $("viewResult").hidden = false;
        window.scrollTo({ top: 0, behavior: "instant" });
        animateBars();
      }
    });

    todayBirth = buildBirth("birthToday", {
      prefix: "t", name: true, gender: true, save: true, privacy: true,
      submit: "오늘 내 운세 확인 🍀", defaults: { y: 1990, m: 5, d: 15 },
      onSubmit: function (input) {
        var res = S.compute(input);
        if (res.error) { todayBirth.error(res.error); return; }
        if (todayBirth.saveEl && todayBirth.saveEl.checked) writeSaved(input);
        syncSaved();
        showToday(res, input);
      }
    });

    birthA = buildBirth("birthA", {
      prefix: "a", name: true, gender: false, save: false, privacy: false,
      namePlaceholder: "이름 (예: 나, 지연)", defaults: { y: 1990, m: 5, d: 15 }
    });
    birthB = buildBirth("birthB", {
      prefix: "b", name: true, gender: false, save: false, privacy: false,
      namePlaceholder: "이름 (예: 상대, 한스)", defaults: { y: 1992, m: 8, d: 20 }
    });

    syncSaved();
  }

  function syncSaved() {
    var rec = readSaved();
    var has = !!rec;
    [sajuBirth, todayBirth].forEach(function (f) {
      if (f && f.saveEl) f.saveEl.checked = has;
    });
    var card = $("todaySaved");
    if (!card) return;
    card.hidden = !has;
    if (has) {
      $("todaySavedText").textContent = savedLabel(rec);
      $("todaySavedMeta").textContent = savedMeta(rec);
    }
  }

  /* ── 탭 전환 ────────────────────────────────────── */
  var VIEWS = {
    saju: { pane: "paneSaju", nav: "navSaju" },
    today: { pane: "paneToday", nav: "navToday" },
    compat: { pane: "paneCompat", nav: "navCompat" }
  };
  function setView(v, scroll) {
    if (!VIEWS[v]) v = "saju";
    state.view = v;
    Object.keys(VIEWS).forEach(function (k) {
      $(VIEWS[k].pane).hidden = (k !== v);
      var nav = $(VIEWS[k].nav);
      nav.setAttribute("aria-selected", k === v ? "true" : "false");
      nav.setAttribute("tabindex", k === v ? "0" : "-1");
    });
    if (scroll !== false) window.scrollTo({ top: 0, behavior: "instant" });
  }
  function navTo(v) {
    setView(v);
    try {
      history.replaceState(null, "", v === "saju" ? location.pathname + location.search : "#" + v);
    } catch (e) { }
  }
  function initTabs() {
    $$(".apptab").forEach(function (b) {
      b.addEventListener("click", function () { navTo(b.getAttribute("data-view")); });
      b.addEventListener("keydown", function (e) {
        var keys = ["saju", "today", "compat"], i = keys.indexOf(b.getAttribute("data-view")), n = null;
        if (e.key === "ArrowRight") n = (i + 1) % keys.length;
        if (e.key === "ArrowLeft") n = (i + keys.length - 1) % keys.length;
        if (n === null) return;
        e.preventDefault();
        navTo(keys[n]);
        $(VIEWS[keys[n]].nav).focus();
      });
    });
    var hash = (location.hash || "").replace("#", "");
    setView(VIEWS[hash] ? hash : "saju", false);
  }

  function animateBars() {
    setTimeout(function () {
      $$(".eb .fill").forEach(function (f) { f.style.transform = "scaleX(" + f.getAttribute("data-w") + ")"; });
    }, 60);
  }

  /* ── 캐릭터 카드 ────────────────────────────────── */
  function charCard(ch) {
    return '<div class="cc-top">'
      + '<div class="cc-emoji" aria-hidden="true">' + ch.emoji + '</div>'
      + '<div><div class="cc-k">MZ 캐릭터 유형</div>'
      + '<div class="cc-name">' + esc(ch.name) + '</div>'
      + '<div class="cc-code">TYPE · ' + esc(ch.code) + ' · ' + esc(ch.stem) + " " + esc(ch.elem) + '</div></div>'
      + '</div>'
      + '<div class="cc-tags">' + ch.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + '</div>'
      + '<p class="cc-line">' + esc(ch.shine) + '</p>'
      + '<p class="cc-chemi"><b>케미</b> · ' + esc(ch.chemi) + '</p>';
  }

  /* ── ① 사주 결과 렌더 ──────────────────────────── */
  var ELEM_C = ["#22B573", "#FF4D6D", "#EF9700", "#8B98AE", "#3D7BFF"];

  function renderSaju(res, b) {
    var nm = res.input.name ? esc(res.input.name) : "";
    $("resWho").textContent = (nm ? nm + " 님 · " : "") + "2027 정미년 토정비결";
    $("resTitle").textContent = b.title;
    $("resSub").textContent = b.subtitle;

    var badge = [];
    badge.push('<span class="chip gold">' + b.tojeong.no + "괘 · " + b.tojeong.grade + "</span>");
    badge.push('<span class="chip">' + S.STEM[res.dayMaster.stem] + S.BRANCH[res.pillars.day.branch] + "일주</span>");
    badge.push('<span class="chip">' + S.ELEM[res.dayMaster.elem] + " 일간 · " + (res.dayMaster.yang ? "양" : "음") + "</span>");
    badge.push('<span class="chip">' + res.solar.y + "." + pad(res.solar.m) + "." + pad(res.solar.d) + " " + (res.hasHour ? hhmm(res.input.h) : "시간 모름") + "</span>");
    $("resBadges").innerHTML = badge.join("");

    $("sajuChar").innerHTML = charCard(DAILY.character(res));

    $("dmSide").textContent = S.STEM[res.dayMaster.stem] + "(" + S.STEM_H[res.dayMaster.stem] + ") 일간";
    $("dmBody").textContent = b.body;
    $("dmTags").innerHTML = b.good.map(function (g) { return '<span class="chip">' + esc(g) + "</span>"; }).join("");
    $("dmWork").innerHTML = "<b>잘 맞는 일</b> · " + esc(b.work);
    $("dmBad").innerHTML = "<b>조심할 점</b> · " + esc(b.bad);

    var bars = "";
    for (var i = 0; i < 5; i++) {
      var w = res.total ? res.counts[i] / res.total : 0;
      bars += '<div class="eb"><div class="nm">' + S.ELEM[i] + '<span>' + ["木", "火", "土", "金", "水"][i] + "</span></div>"
        + '<div class="track"><div class="fill" data-w="' + w.toFixed(3) + '" style="background:' + ELEM_C[i] + '"></div></div>'
        + '<div class="val"><b>' + res.counts[i] + "</b>개 · " + res.pct[i] + "%</div></div>";
    }
    $("elemBars").innerHTML = bars;
    $("elemSide").textContent = res.hasHour ? "여덟 글자 기준" : "여섯 글자(시간 모름) 기준";
    $("elemLegend").innerHTML = ["목", "화", "토", "금", "수"].map(function (n, i) {
      return '<span><i style="background:' + ELEM_C[i] + '"></i>' + n + "</span>";
    }).join("");
    $("elemNotes").innerHTML = b.elemLine.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("")
      + "<p>" + esc(b.strengthLine) + "</p>";

    $("chartSide").textContent = res.hasHour ? "시·일·월·년" : "일·월·년 (시간 모름)";
    $("chart").className = "chart" + (res.hasHour ? "" : " n3");
    $("chart").innerHTML = b.cols.map(function (c) {
      return '<div class="pcol' + (c.key === "day" ? " day" : "") + '">'
        + '<div class="lab">' + c.label + "</div>"
        + '<div class="hz">' + c.stemH + "</div>"
        + '<div class="ko">' + c.stem + "</div>"
        + '<span class="badge" style="background:' + ELEM_C[c.stemElem] + '">' + S.ELEM[c.stemElem] + "</span>"
        + '<div class="hz">' + c.branchH + "</div>"
        + '<div class="ko">' + c.branch + "</div>"
        + '<span class="badge" style="background:' + ELEM_C[c.branchElem] + '">' + S.ELEM[c.branchElem] + "</span>"
        + '<div class="god">' + c.stemGod + " · " + c.branchGod + "</div>"
        + "</div>";
    }).join("");
    $("chartFoot").innerHTML = "일간 <b>" + S.STEM[res.dayMaster.stem] + "(" + S.STEM_H[res.dayMaster.stem] + ")</b> · "
      + (res.lunar ? "음력 " + res.lunar.y + "." + pad(res.lunar.m) + "." + pad(res.lunar.d) + (res.lunar.leap ? " (윤달)" : "") : "")
      + (res.warn.length ? " · " + esc(res.warn.join(" ")) : "");

    $("guaNo").innerHTML = b.tojeong.no + "<small>괘</small>";
    $("guaMeta").innerHTML =
      '<span class="chip gold">상 ' + b.tojeong.sang + " · 중 " + b.tojeong.jung + " · 하 " + b.tojeong.ha + "</span>"
      + '<span class="chip">' + esc(b.tojeong.grade) + "</span>"
      + '<span class="chip">' + esc(b.tojeong.sangImg) + " · " + esc(b.tojeong.jungStage) + "</span>"
      + '<span class="chip">세는나이 ' + b.tojeong.age + "세</span>";

    $("sumBody").innerHTML =
      b.summary.map(function (t, i) {
        return '<p class="panel-lead" style="margin-top:' + (i ? "12px" : "0") + '">' + esc(t) + "</p>";
      }).join("")
      + '<div class="rule"></div>'
      + '<p class="panel-body"><b>' + esc(b.tojeong.sangKw) + " · " + esc(b.tojeong.jungStage) + "</b> — " + esc(b.tojeong.sangLine) + "</p>"
      + '<p class="panel-body">' + esc(b.tojeong.jungLine) + "</p>";

    $("panel-money").innerHTML = fieldHtml("재물", b.fields.money);
    $("panel-love").innerHTML = fieldHtml("연애·관계", b.fields.love);
    $("panel-work").innerHTML = fieldHtml("직업·학업", b.fields.work);
    $("panel-health").innerHTML = fieldHtml("건강", b.fields.health);
    $("panel-year").innerHTML = seunHtml(res, b);

    $("halfSide").textContent = b.tojeong.jungStage + "의 해";
    $("halves").innerHTML =
      '<div class="half"><div class="h">상반기 · 1~6월</div><p>' + esc(b.halves.first) + "</p></div>"
      + '<div class="half"><div class="h">하반기 · 7~12월</div><p>' + esc(b.halves.second) + "</p></div>";

    $("mList").innerHTML = b.months.map(function (mo) {
      return '<div class="mrow"><div class="mo"><b>' + mo.m + "월</b><span>" + mo.branchName + " · " + mo.hanja + "</span></div>"
        + '<div class="mt"><span class="cat cat-' + mo.cat + '">' + mo.cat + "</span>" + esc(mo.text) + "</div></div>";
    }).join("");

    $("lucky").innerHTML =
      '<div class="lcard"><div class="k">행운의 컬러 · ' + esc(b.lucky.elem) + '</div><div class="v"><span class="swatch" style="background:' + b.lucky.hex + '"></span>' + esc(b.lucky.color) + "</div>"
      + '<div class="d">' + esc(b.lucky.items) + "</div></div>"
      + '<div class="lcard"><div class="k">행운의 숫자</div><div class="v">' + b.lucky.number.join(" · ") + "</div>"
      + '<div class="d">전화번호·비밀번호를 바꾸라는 뜻은 아니에요. 기억하기 좋은 숫자로.</div></div>'
      + '<div class="lcard"><div class="k">주의할 달</div><div class="v">' + esc(b.lucky.cautionMonths.join(", ")) + "</div>"
      + '<div class="d">' + esc(b.lucky.cautionNote) + "</div></div>";

    state.sajuCopy = buildSajuCopy(res, b);
  }

  function fieldHtml(label, arr) {
    return '<p class="panel-lead">' + esc(arr[0]) + '</p><p class="panel-body">' + esc(arr[1]) + "</p>";
  }
  function seunHtml(res, b) {
    var relTxt = b.seunInfo.relations.length
      ? b.seunInfo.relations.map(function (r) {
        var lab = { year: "년지", month: "월지", day: "일지", hour: "시지" }[r.key];
        return lab + " " + S.BRANCH[r.branch] + "(" + S.BRANCH_H[r.branch] + ")" + " — " + r.tags.join("·");
      }).join(" / ")
      : "원국 지지와 특별히 부딪히거나 합하는 자리는 없어요.";
    return '<p class="panel-lead">2027년은 정미(丁未)년. 천간은 <b>정(丁)</b> 화, 지지는 <b>미(未)</b> 토예요.</p>'
      + '<p class="panel-body">내 일간과의 관계는 천간 <b>' + b.seunInfo.god + "</b>, 지지 <b>" + b.seunInfo.godBranch + "</b>. 한 해의 큰 기운은 ‘" + esc(b.seunInfo.kw) + "’예요.</p>"
      + '<p class="panel-body">미(未)는 내 일간 기준 <b>' + b.seunInfo.wunseong + "</b> 자리예요.</p>"
      + '<div class="rule"></div>'
      + '<p class="panel-body"><b>원국과의 관계</b><br>' + esc(relTxt) + "</p>";
  }
  function hhmm(h) { return pad(h) + ":00경"; }

  function buildSajuCopy(res, b) {
    var ch = DAILY.character(res);
    var L = [];
    L.push("🔮 2027 정미년 토정비결 · " + b.title);
    L.push(b.subtitle + " · " + b.tojeong.no + "괘(" + b.tojeong.grade + ")");
    L.push("");
    L.push("▸ 캐릭터 유형 " + ch.emoji + " " + ch.name + " " + ch.tags.join(" "));
    L.push("");
    L.push("▸ 총운");
    L.push(b.summary[0]);
    L.push(b.summary[1]);
    L.push(b.summary[2]);
    L.push("");
    L.push("▸ 사주 팔자 (" + (res.hasHour ? "년·월·일·시" : "년·월·일") + ")");
    L.push([res.pillars.year, res.pillars.month, res.pillars.day, res.pillars.hour].filter(function (p) { return p; })
      .map(function (p) { return S.STEM[p.stem] + S.BRANCH[p.branch]; }).join(" · ")
      + "  |  " + ["목", "화", "토", "금", "수"].map(function (n, i) { return n + res.counts[i]; }).join(" "));
    L.push("");
    L.push("▸ 2027 분야별");
    L.push("· 재물 — " + b.fields.money[0]);
    L.push("· 연애·관계 — " + b.fields.love[0]);
    L.push("· 직업·학업 — " + b.fields.work[0]);
    L.push("· 건강 — " + b.fields.health[0]);
    L.push("");
    L.push("▸ 행운의 컬러 " + b.lucky.color + " · 숫자 " + b.lucky.number.join(", ") + " · 주의할 달 " + b.lucky.cautionMonths.join(", "));
    L.push("");
    L.push("https://econature7-lab.github.io/nori-apps/saju/");
    return L.join("\n");
  }

  /* ── ② 오늘의 운세 ──────────────────────────────── */
  function showToday(res, input) {
    var f = DAILY.compute(res);
    state.today = { res: res, f: f, input: input };
    renderToday(res, f);
    $("todayForm").hidden = true;
    $("todayResult").hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    animateBars();
  }

  function renderToday(res, f) {
    var nm = res.input.name ? esc(res.input.name) : "";
    $("tResWho").textContent = (nm ? nm + " 님 · " : "") + "오늘의 운세";
    $("tResDate").textContent = f.dateLabel;
    $("tResWd").textContent = "";
    $("tResSub").textContent = "일진 " + f.gz.name + "(" + f.gz.hanja + ")일 · 내 일간 " + S.STEM[res.dayMaster.stem] + "(" + S.STEM_H[res.dayMaster.stem] + ") " + S.ELEM[res.dayMaster.elem] + " 기준";

    $("tResBadges").innerHTML =
      '<span class="chip gold">' + esc(f.gz.name) + "일 · " + esc(f.tenStem) + "</span>"
      + '<span class="chip">' + esc(f.tenBranch) + " · " + esc(f.wunseong) + "</span>"
      + '<span class="chip">' + esc(f.character.emoji) + " " + esc(f.character.name) + "</span>"
      + (res.hasHour ? "" : '<span class="chip">시간 모름 · 6글자</span>');

    $("todayChar").innerHTML = charCard(f.character);

    $("tTotal").textContent = f.scores.total;
    $("tGradeLabel").textContent = f.grade.label;
    $("tGradeHead").textContent = f.grade.head;
    $("tGradeLine").textContent = f.grade.line;

    var rows = [
      ["금전", f.scores.money, "#EF9700"],
      ["연애", f.scores.love, "#FF4D6D"],
      ["일·학업", f.scores.work, "#3D7BFF"]
    ];
    $("tBars").innerHTML = rows.map(function (r) {
      return '<div class="eb eb3"><div class="nm">' + r[0] + "</div>"
        + '<div class="track"><div class="fill" data-w="' + (r[1] / 100).toFixed(2) + '" style="background:' + r[2] + '"></div></div>'
        + '<div class="val"><b>' + r[1] + "</b>점</div></div>";
    }).join("");

    $("tRelation").innerHTML = "<b>오늘의 자리</b> · " + esc(f.relationLine);

    $("tMoney").textContent = f.scores.money + "점";
    $("tLove").textContent = f.scores.love + "점";
    $("tWork").textContent = f.scores.work + "점";
    $("tMoneyTxt").textContent = f.god.money;
    $("tLoveTxt").textContent = f.god.love;
    $("tWorkTxt").textContent = f.god.work;

    $("tLuckySwatch").style.background = f.lucky.hex;
    $("tLuckyColor").textContent = f.lucky.color + " (" + f.lucky.elem + ")";
    $("tLuckyItems").textContent = f.lucky.items;
    $("tLuckyNum").textContent = f.lucky.number.join(" · ");
    $("tAdvice").textContent = "“" + f.advice + "”";

    state.todayCopy = DAILY.shareText(res, f, res.input.name);
  }

  /* ── ③ 둘이 보는 궁합 ───────────────────────────── */
  $$("#cTypeSeg [data-type]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.ctype = b.getAttribute("data-type");
      $$("#cTypeSeg [data-type]").forEach(function (x) {
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
    });
  });

  function runCompat() {
    var err = $("compatErr");
    err.classList.remove("show");
    var ia = birthA.read(), ib = birthB.read();
    var ra = S.compute(ia);
    if (ra.error) { err.textContent = "나: " + ra.error; err.classList.add("show"); return; }
    var rb = S.compute(ib);
    if (rb.error) { err.textContent = "상대방: " + rb.error; err.classList.add("show"); return; }
    var r = COMPAT.compute(ra, rb, state.ctype);
    state.compat = { a: ra, b: rb, r: r };
    renderCompat(ra, rb, r);
    $("compatForm").hidden = true;
    $("compatResult").hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function renderCompat(a, b, r) {
    $("cResWho").textContent = r.type.emoji + " " + r.type.label + " 궁합";
    $("cNameA").textContent = r.names.a;
    $("cNameB").textContent = r.names.b;
    $("cHeart").textContent = "×";
    $("cResSub").textContent = "나 " + S.STEM[a.dayMaster.stem] + "(" + S.ELEM[a.dayMaster.elem] + ") · 상대 "
      + S.STEM[b.dayMaster.stem] + "(" + S.ELEM[b.dayMaster.elem] + ") — "
      + (a.hasHour && b.hasHour ? "두 사람 모두 시간까지 반영" : "시간을 모르는 사람은 6글자로 계산");

    $("cResBadges").innerHTML =
      '<span class="chip gold">' + r.score + "% · " + esc(r.band.label) + "</span>"
      + '<span class="chip">' + S.STEM[a.pillars.day.stem] + S.BRANCH[a.pillars.day.branch] + "일주 × " + S.STEM[b.pillars.day.stem] + S.BRANCH[b.pillars.day.branch] + "일주</span>"
      + '<span class="chip">' + esc(r.type.emoji + " " + r.type.label) + "</span>";

    $("cScore").textContent = r.score;
    $("cBand").textContent = r.band.label;
    $("cSummary").textContent = "“" + r.summary + "”";

    $("cDuo").innerHTML =
      '<div class="p"><div class="e">' + r.charA.emoji + '</div><div class="n">' + esc(r.names.a) + "</div><div class=\"s\">" + esc(r.charA.name) + "</div></div>"
      + '<div class="x" aria-hidden="true">♥</div>'
      + '<div class="p"><div class="e">' + r.charB.emoji + '</div><div class="n">' + esc(r.names.b) + "</div><div class=\"s\">" + esc(r.charB.name) + "</div></div>";

    $("cTypeSide").textContent = r.type.label + " 기준";
    $("cChemi").innerHTML = r.chemi.map(function (t, i) {
      return '<p class="' + (i === 0 ? "panel-lead" : "panel-body") + '"' + (i === 1 ? ' style="margin-top:12px"' : "") + '>' + esc(t) + "</p>";
    }).join("");

    $("cGood").innerHTML = r.good.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("");
    $("cBad").innerHTML = r.caution.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    $("cBasis").innerHTML = r.basis.map(function (x) { return '<span class="chip soft">' + esc(x) + "</span>"; }).join("");

    state.compatCopy = COMPAT.shareText(a, b, r);
  }

  /* ── 복사 ───────────────────────────────────────── */
  function copyText(text, msg) {
    if (!text) return;
    window.NORI_LAST_COPY = text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast(msg); },
        function () { fallbackCopy(text, msg); }
      );
    } else fallbackCopy(text, msg);
  }
  function fallbackCopy(text, msg) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.left = "-9999px"; ta.style.top = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    toast(ok ? msg : "복사가 막혔어요. 화면을 길게 눌러 선택해 주세요.");
  }

  /* ── 토정비결 분야 탭 ───────────────────────────── */
  function initResultTabs() {
    var TABS = ["summary", "money", "love", "work", "health", "year"];
    $$("#viewResult .tab").forEach(function (t) {
      t.addEventListener("click", function () {
        var key = t.getAttribute("data-tab");
        $$("#viewResult .tab").forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
        TABS.forEach(function (k) { $("panel-" + k).hidden = (k !== key); });
      });
      t.addEventListener("keydown", function (e) {
        var i = TABS.indexOf(t.getAttribute("data-tab")), n = null;
        if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
        if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length;
        if (n === null) return;
        e.preventDefault();
        var el = document.querySelector('#viewResult .tab[data-tab="' + TABS[n] + '"]');
        el.focus(); el.click();
      });
    });
  }

  /* ── 개인정보 모달 ──────────────────────────────── */
  var modal = null, lastFocus = null;
  function openModal() {
    modal = modal || $("privacyModal");
    lastFocus = document.activeElement;
    modal.classList.add("show"); modal.setAttribute("aria-hidden", "false");
    var f = modal.querySelector("button[data-close]"); if (f) f.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("show"); modal.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  }

  /* ── 시작 ───────────────────────────────────────── */
  function init() {
    mountForms();
    initTabs();
    initResultTabs();

    $("copyBtn").addEventListener("click", function () { copyText(state.sajuCopy, "복사했어요. X·카톡에 붙여 넣으세요."); });
    $("tCopyBtn").addEventListener("click", function () { copyText(state.todayCopy, "오늘 운세를 복사했어요. X·카톡에 붙여 넣으세요."); });
    $("cCopyBtn").addEventListener("click", function () { copyText(state.compatCopy, "궁합 결과를 복사했어요. X·카톡에 붙여 넣으세요."); });

    $("againBtn").addEventListener("click", function () {
      $("viewResult").hidden = true;
      $("viewForm").hidden = false;
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    $("tAgainBtn").addEventListener("click", function () {
      $("todayResult").hidden = true;
      $("todayForm").hidden = false;
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    $("cAgainBtn").addEventListener("click", function () {
      $("compatResult").hidden = true;
      $("compatForm").hidden = false;
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    $("todaySavedGo").addEventListener("click", function () {
      var rec = readSaved();
      if (!rec) { syncSaved(); return; }
      var res = S.compute(rec);
      if (res.error) { toast(res.error); return; }
      todayBirth.set(rec);
      showToday(res, rec);
    });
    $("todaySavedDel").addEventListener("click", function () {
      clearSaved();
      syncSaved();
      toast("저장된 사주를 지웠어요");
    });

    $("compatGo").addEventListener("click", runCompat);

    $("openPrivacy").addEventListener("click", function (e) { e.preventDefault(); openModal(); });
    var pm = $("privacyModal");
    pm.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && pm.classList.contains("show")) closeModal();
    });

    $$("a[data-goto]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        navTo(a.getAttribute("data-goto"));
      });
    });
    window.addEventListener("hashchange", function () {
      var hash = (location.hash || "").replace("#", "");
      if (VIEWS[hash]) setView(hash, false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
