/* ─────────────────────────────────────────────────────────────
   saju-core.js — 만세력 · 사주 · 2027 토정비결 계산 엔진
   · 입력: 양력/음력 생년월일시
   · 출력: 년·월·일·시주, 오행 분포, 일간, 2027 정미년 세운, 토정비결 144괘
   모든 계산은 브라우저 안에서만 이루어집니다. (서버 전송 없음)
   ───────────────────────────────────────────────────────────── */
(function (global) {
  "use strict";

  var D = global.SAJU_DATA;

  var STEM = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  var STEM_H = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var BRANCH = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  var BRANCH_H = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  var ELEM = ["목", "화", "토", "금", "수"];
  var STEM_ELEM = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
  var BRANCH_ELEM = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
  var TERM_NAMES = ["소한", "입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설"];

  /* ── 율리우스일 · 날짜 ─────────────────────────────── */
  function jdn(y, m, d) {
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
      - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function ymdOf(j) {
    var a = j + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor(146097 * b / 4);
    var dd = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * dd / 4);
    var mm = Math.floor((5 * e + 2) / 153);
    return {
      y: 100 * b + dd - 4800 + Math.floor(mm / 10),
      m: mm + 3 - 12 * Math.floor(mm / 10),
      d: e - Math.floor((153 * mm + 2) / 5) + 1
    };
  }
  var ORD0 = jdn(1939, 1, 1);          // 음력표의 0일 기준
  function ordOf(y, m, d) { return jdn(y, m, d) - ORD0; }

  /* ── 12절기 표 해독 ────────────────────────────────── */
  function p36(s) { return parseInt(s, 36); }
  var TERM = {};                        // TERM[year] = [절대분 12개]
  (function () {
    for (var i = 0; i < D.termCount; i++) {
      var y = D.termBase + i, arr = [];
      for (var k = 0; k < 12; k++) {
        var mins = p36(D.terms.substr(i * 48 + k * 4, 4));
        arr.push(ordOf(y, 1, 1) * 1440 + mins);
      }
      TERM[y] = arr;
    }
  })();
  function termDate(y, i) {              // 표시용 (연,월,일,시,분)
    var base = TERM[y][i] - ordOf(y, 1, 1) * 1440;
    var dt = ymdOf(ORD0 + Math.floor(base / 1440));
    return { y: dt.y, m: dt.m, d: dt.d, hh: Math.floor((base % 1440) / 60), mm: base % 60, name: TERM_NAMES[i] };
  }

  /* ── 음력 월 표 해독 ───────────────────────────────── */
  var MONTHS = [];
  (function () {
    for (var i = 0; i < D.lunarCount; i++) {
      var c = D.lunar.substr(i * 10, 10);
      var s = p36(c.substr(0, 5)), leap = p36(c.substr(5, 1)), mask = p36(c.substr(6, 4));
      var y = D.lunarBase + i, idx = 0;
      for (var m = 1; m <= 12; m++) {
        MONTHS.push({ y: y, m: m, leap: false, s: s });
        s += ((mask >> idx) & 1) ? 30 : 29; idx++;
        if (leap === m) {
          MONTHS.push({ y: y, m: m, leap: true, s: s });
          s += ((mask >> idx) & 1) ? 30 : 29; idx++;
        }
      }
    }
  })();
  var LUNAR_MIN = MONTHS[0].s, LUNAR_MAX = MONTHS[MONTHS.length - 1].s;

  function solarToLunar(y, m, d) {
    var o = ordOf(y, m, d);
    if (o < LUNAR_MIN || o >= LUNAR_MAX) return null;
    var lo = 0, hi = MONTHS.length - 1, k = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (MONTHS[mid].s <= o) { k = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    var mo = MONTHS[k];
    return { y: mo.y, m: mo.m, leap: mo.leap, d: o - mo.s + 1, length: MONTHS[k + 1].s - mo.s };
  }
  function lunarMonthIndex(y, m, leap) {
    for (var i = 0; i < MONTHS.length; i++) {
      if (MONTHS[i].y === y && MONTHS[i].m === m && MONTHS[i].leap === !!leap) return i;
    }
    return -1;
  }
  function lunarToSolar(y, m, leap, d) {
    var i = lunarMonthIndex(y, m, leap);
    if (i < 0) return null;
    var len = MONTHS[i + 1].s - MONTHS[i].s;
    if (d < 1 || d > len) return null;
    var r = ymdOf(ORD0 + MONTHS[i].s + d - 1);
    r.leap = !!leap; r.length = len;
    return r;
  }
  function lunarMonthLength(y, m) {
    var i = lunarMonthIndex(y, m, false);
    return i < 0 ? 0 : MONTHS[i + 1].s - MONTHS[i].s;
  }

  /* ── 간지 ──────────────────────────────────────────── */
  function gz60(i) { i = ((i % 60) + 60) % 60; return { s: i % 10, b: i % 12 }; }
  function gzIndexOfDate(y, m, d) { return ((jdn(y, m, d) + D.dayOffset) % 60 + 60) % 60; }

  /* ── 사주 산출 ─────────────────────────────────────── */
  function compute(input) {
    var solar = null, lunar = null, warn = [];

    if (input.calendar === "lunar") {
      var li = lunarMonthIndex(input.y, input.m, input.leap);
      if (li < 0) return { error: "음력 " + input.y + "년 " + input.m + "월" + (input.leap ? "(윤달)" : "") + "은 없는 달입니다. 윤달 여부를 확인해 주세요." };
      var len = MONTHS[li + 1].s - MONTHS[li].s;
      if (input.d > len) return { error: "음력 " + input.m + "월은 " + len + "일까지입니다. 생일을 다시 확인해 주세요." };
      var so = ymdOf(ORD0 + MONTHS[li].s + input.d - 1);
      solar = { y: so.y, m: so.m, d: so.d };
      lunar = { y: input.y, m: input.m, d: input.d, leap: !!input.leap, length: len };
    } else {
      solar = { y: input.y, m: input.m, d: input.d };
      lunar = solarToLunar(solar.y, solar.m, solar.d);
      if (!lunar) return { error: "음력 변환 범위(1940~2028년)를 벗어난 날짜입니다." };
    }
    if (solar.y < 1940 || solar.y > 2026) return { error: "생년월일은 1940~2026년 사이로 입력해 주세요." };

    var hasHour = input.h !== null && input.h !== undefined;
    var h = hasHour ? input.h : 12;
    var abs = ordOf(solar.y, solar.m, solar.d) * 1440 + h * 60 + (input.minute || 0);

    /* 년주 — 입춘 기준 */
    var sy = solar.y, terms = TERM[sy];
    var sajuYear = abs >= terms[1] ? sy : sy - 1;

    /* 월주 — 12절기 기준 */
    var ti = -1;
    for (var i = 11; i >= 0; i--) { if (abs >= terms[i]) { ti = i; break; } }
    if (ti < 0) ti = 11;                       // 소한 이전 → 전년 대설(자월)
    var mBranch = (ti + 1) % 12;
    var mOrder = ((mBranch - 2 + 12) % 12) + 1; // 인월=1 … 축월=12
    var yStem = ((sajuYear - 4) % 10 + 10) % 10;
    var mStem = (yStem * 2 + mOrder + 1) % 10;

    /* 일주 — 23시 이후는 다음 날 */
    var dayShift = hasHour && h >= 23 ? 1 : 0;
    var dgz = gzIndexOfDate(solar.y, solar.m, solar.d) + dayShift;
    var dStem = ((dgz % 10) + 10) % 10, dBranch = ((dgz % 12) + 12) % 12;

    /* 시주 */
    var hPillar = null;
    if (hasHour) {
      var hBranch = Math.floor(((h + 1) % 24) / 2);
      var hStem = (dStem * 2 + hBranch) % 10;
      hPillar = { stem: hStem, branch: hBranch };
    }

    var pillars = {
      year: { stem: yStem, branch: ((sajuYear - 4) % 12 + 12) % 12 },
      month: { stem: mStem, branch: mBranch },
      day: { stem: dStem, branch: dBranch },
      hour: hPillar
    };

    if (!hasHour) warn.push("태어난 시간을 몰라 시주를 뺀 6글자로 계산했습니다.");

    /* 오행 분포 */
    var counts = [0, 0, 0, 0, 0];
    var chars = [];
    ["year", "month", "day", "hour"].forEach(function (k) {
      var p = pillars[k]; if (!p) return;
      counts[STEM_ELEM[p.stem]]++;
      counts[BRANCH_ELEM[p.branch]]++;
      chars.push({ key: k, stem: p.stem, branch: p.branch });
    });
    var total = chars.length * 2;
    var pct = counts.map(function (c) { return Math.round(c / total * 100); });

    /* 강약(비겁·인성 vs 식상·재성·관성) */
    var de = STEM_ELEM[dStem];
    var same = counts[de], resource = counts[(de + 4) % 5];
    var output = counts[(de + 1) % 5], wealth = counts[(de + 2) % 5], power = counts[(de + 3) % 5];
    var support = same + resource, drain = output + wealth + power;
    var strength = support - drain >= 2 ? "strong" : (drain - support >= 2 ? "weak" : "balanced");

    /* 2027 정미년 세운 */
    var seun = { stem: 3, branch: 7, name: "정미", year: 2027 };
    seun.stemElem = STEM_ELEM[seun.stem];
    seun.branchElem = 2;                        // 미(未) 본기 기토
    seun.tenGodStem = tenGod(de, dStem % 2 === 0, seun.stemElem, false);
    seun.tenGodBranch = tenGod(de, dStem % 2 === 0, 2, true);
    seun.wunseong = wunseong(dStem, seun.branch);
    seun.relations = [];
    [["year", pillars.year], ["month", pillars.month], ["day", pillars.day], ["hour", pillars.hour]].forEach(function (pair) {
      if (!pair[1]) return;
      var tags = relation(seun.branch, pair[1].branch);
      if (tags.length) seun.relations.push({ key: pair[0], branch: pair[1].branch, tags: tags });
    });

    var result = {
      input: input,
      hasHour: hasHour,
      solar: solar,
      lunar: lunar,
      pillars: pillars,
      chars: chars,
      counts: counts,
      pct: pct,
      total: total,
      strongest: counts.indexOf(Math.max.apply(null, counts)),
      weakest: null,
      strength: strength,
      dayMaster: { stem: dStem, elem: de, yang: dStem % 2 === 0 },
      seun: seun,
      warn: warn,
      terms: { ipchun: termDate(sajuYear, 1) }
    };
    /* 가장 약한(또는 없는) 오행 */
    var min = Math.min.apply(null, counts);
    result.weakest = counts.indexOf(min);
    result.missing = [];
    counts.forEach(function (c, i) { if (c === 0) result.missing.push(i); });

    /* 토정비결 */
    result.tojeong = tojeong(result);
    return result;
  }

  /* ── 십성 ──────────────────────────────────────────── */
  var TEN_GOD = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  function tenGod(dayElem, dayYang, tElem, tYang) {
    var same = (dayYang === tYang);
    if (tElem === dayElem) return same ? "비견" : "겁재";
    if (tElem === (dayElem + 1) % 5) return same ? "식신" : "상관";
    if (tElem === (dayElem + 2) % 5) return same ? "편재" : "정재";
    if (tElem === (dayElem + 3) % 5) return same ? "편관" : "정관";
    return same ? "편인" : "정인";
  }

  /* ── 12운성 ────────────────────────────────────────── */
  var WUNSEONG = ["장생", "목욕", "관대", "임관", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];
  var JANGSAENG = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
  function wunseong(stem, branch) {
    var dir = stem % 2 === 0 ? 1 : -1;
    var d = ((branch - JANGSAENG[stem]) * dir % 12 + 12) % 12;
    return WUNSEONG[d];
  }

  /* ── 지지 관계 ─────────────────────────────────────── */
  var CHUNG = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
  var YUKHAP = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  var PA = [9, 4, 11, 6, 5, 8, 3, 10, 1, 0, 7, 2];
  var HAE = [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8];
  var SAMHAP = [[2, 6, 10, "화"], [11, 3, 7, "목"], [8, 0, 4, "수"], [5, 9, 1, "금"]];
  function relation(a, b) {
    if (a === b && [4, 6, 9, 11].indexOf(a) >= 0) return ["자형"];
    var out = [];
    if (CHUNG[a] === b) out.push("충");
    if (YUKHAP[a] === b) out.push("육합");
    if (PA[a] === b) out.push("파");
    if (HAE[a] === b) out.push("해");
    for (var i = 0; i < SAMHAP.length; i++) {
      var g = SAMHAP[i];
      if (g.indexOf(a) >= 0 && g.indexOf(b) >= 0 && a !== b) out.push("삼합(" + g[3] + ")");
    }
    if ((a === 2 && b === 5) || (a === 5 && b === 2) || (a === 5 && b === 8) || (a === 8 && b === 5) || (a === 2 && b === 8) || (a === 8 && b === 2)) out.push("형");
    if ((a === 1 && b === 10) || (a === 10 && b === 1) || (a === 10 && b === 7) || (a === 7 && b === 10) || (a === 1 && b === 7) || (a === 7 && b === 1)) out.push("형");
    if ((a === 0 && b === 3) || (a === 3 && b === 0)) out.push("형");
    return out;
  }

  /* ── 토정비결 144괘 (전통 작괘법) ──────────────────── */
  var STEM_NUM = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
  var BRANCH_NUM = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
  var BRANCH_TAESE = [11, 13, 10, 10, 13, 9, 9, 13, 12, 12, 13, 11];

  function tojeong(res) {
    var ly = res.lunar.y, lm = res.lunar.m, ld = res.lunar.d;
    var seunYear = 2027, seunStem = 3, seunBranch = 7;

    var age = seunYear - ly + 1;                                  // 세는나이
    var taeSe = STEM_NUM[seunStem] + BRANCH_TAESE[seunBranch];     // 2027 = 19
    var sang = (age + taeSe) % 8; if (sang === 0) sang = 8;

    var len = lunarMonthLength(seunYear, lm);                      // 2027년 그 음력달의 날수
    var mStem = (seunStem * 2 + lm + 1) % 10;                      // 오호둔법 (음력 1월=인월)
    var mBranch = (lm + 1) % 12;
    var wolGeon = STEM_NUM[mStem] + BRANCH_NUM[mBranch];
    var jung = (len + wolGeon) % 6; if (jung === 0) jung = 6;

    var day = Math.min(ld, len);                                   // 그해 그 달에 없는 날짜 보정
    var solarOfBirthday = lunarToSolar(seunYear, lm, false, day);
    var gz = solarOfBirthday ? gzIndexOfDate(solarOfBirthday.y, solarOfBirthday.m, solarOfBirthday.d) : 0;
    var iljin = STEM_NUM[gz % 10] + BRANCH_TAESE[gz % 12] - 2;
    var ha = (day + iljin) % 3; if (ha === 0) ha = 3;

    var clamped = ld > len;
    return {
      sang: sang, jung: jung, ha: ha,
      no: sang * 100 + jung * 10 + ha,
      age: age, taeSe: taeSe, wolGeon: wolGeon, iljin: iljin,
      monthLen: len, dayUsed: day, clamped: clamped,
      monthGz: { stem: mStem, branch: mBranch },
      solarOfBirthday: solarOfBirthday,
      dayGz: gz60(gz)
    };
  }

  /* ── 2027 월별 (절기 기준) ─────────────────────────── */
  function months2027() {
    var out = [];
    for (var i = 2; i < 12; i++) {          // 인월(입춘)~자월(대설)
      var t = termDate(2027, i === 0 ? 0 : i);
      out.push({ ti: i, branch: (i + 1) % 12, start: termDate(2027, i) });
    }
    for (var k = 0; k < 2; k++) {            // 2028 소한·입춘 이전 = 축월
      out.push({ ti: 0, branch: 1, start: termDate(2028, 0) });
    }
    return out.slice(0, 12);
  }

  global.SAJU = {
    STEM: STEM, STEM_H: STEM_H, BRANCH: BRANCH, BRANCH_H: BRANCH_H,
    ELEM: ELEM, STEM_ELEM: STEM_ELEM, BRANCH_ELEM: BRANCH_ELEM,
    TERM_NAMES: TERM_NAMES, TEN_GOD: TEN_GOD,
    compute: compute,
    tenGod: tenGod,
    wunseong: wunseong,
    relation: relation,
    solarToLunar: solarToLunar,
    lunarToSolar: lunarToSolar,
    lunarMonthLength: lunarMonthLength,
    termDate: termDate,
    jdn: jdn, ymdOf: ymdOf,
    gzIndexOfDate: gzIndexOfDate,
    gz60: gz60
  };
})(window);
