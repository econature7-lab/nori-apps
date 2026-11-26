/* ─────────────────────────────────────────────────────────────
   saju-compat.js — 둘이 보는 궁합
   · 일간 오행 상생·상극, 천간합·천간충, 일지 합·충·형·파·해,
     오행 보완, 십성 관계로 궁합 점수(%)와 문안을 만듭니다.
   · 관계 유형(연인·썸·친구·동료/최애)에 따라 가중치가 달라집니다.
   모든 계산은 브라우저 안에서만 (서버 전송 없음)
   ───────────────────────────────────────────────────────────── */
(function (global) {
  "use strict";

  var TYPES = {
    lover: { key: "lover", label: "연인", emoji: "💞", intro: "연인 궁합은 끌림만큼 ‘부딪힌 뒤 푸는 방식’을 봐요. 끌림이 세도 화해가 느리면 오래 못 가요." },
    crush: { key: "crush", label: "썸", emoji: "💌", intro: "썸 궁합은 아직 서로를 다 모르는 사이니까 ‘끌리는 힘’을 먼저 봐요. 합이 많으면 한 걸음 더 나가 볼 만해요." },
    friend: { key: "friend", label: "친구", emoji: "🫂", intro: "친구 궁합은 편안함과 오래 감이에요. 취향이 달라도 같이 있을 때 숨이 편한 쪽이 오래 가요." },
    work: { key: "work", label: "동료·최애", emoji: "🤝", intro: "동료·최애 궁합은 좋아하는 마음보다 ‘역할이 맞는지’를 봐요. 서로의 빈 곳을 채워 주면 오래 갑니다." }
  };

  var BANDS = [
    { min: 80, label: "찰떡 궁합", line: "두 사람의 글자가 꽤 잘 맞물려요. 같이 있으면 일이 풀리고, 말이 통하는 순간이 많아요." },
    { min: 70, label: "잘 맞는 편", line: "잘 맞는 편이에요. 다르게 표현하는 부분만 서로 확인하면 훨씬 편해져요." },
    { min: 60, label: "노력하면 좋아요", line: "맞는 부분과 부딪히는 부분이 반반이에요. 규칙을 하나 정해 두면 오래 가요." },
    { min: 50, label: "다른 점이 많아요", line: "다른 점이 많은 사이예요. 그 다름이 서로를 채워 주기도 하니, 기대치를 낮추면 편해져요." },
    { min: 0, label: "서로 다른 세계", line: "서로 다른 세계에 사는 두 사람이에요. 억지로 맞추기보다 각자의 자리를 인정할 때 편해져요." }
  ];

  var TEN_SCORE = { "비견": 0, "겁재": -2, "식신": 3, "상관": -1, "편재": 2, "정재": 3, "편관": -1, "정관": 3, "편인": 1, "정인": 3 };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

  function elemRel(a, b) {
    if (a === b) return "same";
    if ((a + 1) % 5 === b) return "saeng";
    if ((b + 1) % 5 === a) return "saengRev";
    if ((a + 2) % 5 === b) return "geuk";
    return "geukRev";
  }

  function coverGap(x, y) {
    var pts = 0;
    (x.missing || []).forEach(function (e) {
      if (y.counts[e] >= 2) pts += 4; else if (y.counts[e] === 1) pts += 2;
    });
    if (!(x.missing || []).length) {
      var w = x.weakest;
      if (y.counts[w] >= 3) pts += 2; else if (y.counts[w] === 2) pts += 1;
    }
    return Math.min(5, pts);
  }

  function compute(a, b, typeKey) {
    var S = global.SAJU;
    var T = TYPES[typeKey] || TYPES.lover;
    var ae = a.dayMaster.elem, be = b.dayMaster.elem;
    var as = a.pillars.day.stem, bs = b.pillars.day.stem;
    var ab = a.pillars.day.branch, bb = b.pillars.day.branch;
    var W = {
      lover: { stemHap: 1.00, branchHap: 1.00, bad: 1.00, boan: 1.00, ten: 1.00 },
      crush: { stemHap: 1.15, branchHap: 1.00, bad: 0.85, boan: 0.90, ten: 1.00 },
      friend: { stemHap: 0.70, branchHap: 1.00, bad: 0.60, boan: 1.15, ten: 0.90 },
      work: { stemHap: 0.60, branchHap: 0.85, bad: 0.70, boan: 1.20, ten: 1.30 }
    }[T.key];

    /* 1) 일간 오행 */
    var er = elemRel(ae, be);
    var elemPts = { same: 4, saeng: 11, saengRev: 12, geuk: -2, geukRev: -1 }[er];
    var elemLine = {
      same: S.ELEM[ae] + "끼리 같은 오행 — 설명이 필요 없는 동질감",
      saeng: "내 " + S.ELEM[ae] + " → 상대 " + S.ELEM[be] + " 상생 — 내가 먼저 챙기는 사이",
      saengRev: "상대 " + S.ELEM[be] + " → 내 " + S.ELEM[ae] + " 상생 — 상대가 나를 채워 주는 사이",
      geuk: "내 " + S.ELEM[ae] + " → 상대 " + S.ELEM[be] + " 상극 — 내가 주도권을 쥐는 사이",
      geukRev: "상대 " + S.ELEM[be] + " → 내 " + S.ELEM[ae] + " 상극 — 상대 기세에 눌리기 쉬운 사이"
    }[er];

    /* 2) 천간 */
    var stemHap = (as + 5) % 10 === bs;
    var stemChung = Math.abs(as - bs) === 6;
    var stemHapPts = stemHap ? 12 * W.stemHap : 0;
    var stemChungPts = stemChung ? -8 * W.bad : 0;

    /* 3) 일지 */
    var tags = S.relation(ab, bb);
    var branchHap = (tags.indexOf("육합") >= 0 ? 12 : 0)
      + (tags.some(function (t) { return t.indexOf("삼합") === 0; }) ? 10 : 0);
    branchHap = branchHap * W.branchHap;
    var badPts = 0;
    if (tags.indexOf("충") >= 0) badPts += -11;
    if (tags.indexOf("형") >= 0) badPts += -5;
    if (tags.indexOf("파") >= 0) badPts += -4;
    if (tags.indexOf("해") >= 0) badPts += -3;
    if (tags.indexOf("자형") >= 0) badPts += -2;
    badPts = badPts * W.bad;

    /* 4) 오행 보완 */
    var boanA = coverGap(a, b), boanB = coverGap(b, a);
    var boanPts = (boanA + boanB) * W.boan;

    /* 5) 십성 — 상대가 내게 어떤 기운인가 */
    var god = S.tenGod(ae, a.dayMaster.yang, be, b.dayMaster.yang);
    var tenPts = (TEN_SCORE[god] || 0) * W.ten;

    /* 6) 같은 글자 */
    var samePts = (as === bs && ab === bb) ? 2 : ((as === bs || ab === bb) ? 1 : 0);

    var raw = 52 + elemPts + stemHapPts + stemChungPts + branchHap + badPts + boanPts + tenPts + samePts;
    var score = clamp(raw, 32, 96);

    var band = BANDS[BANDS.length - 1];
    for (var i = 0; i < BANDS.length; i++) { if (score >= BANDS[i].min) { band = BANDS[i]; break; } }

    /* 근거 칩 */
    var basis = [];
    basis.push(elemLine);
    if (stemHap) basis.push("천간 " + S.STEM[as] + S.STEM[bs] + " 합(合) — 서로 끌리는 글자");
    if (stemChung) basis.push("천간 " + S.STEM[as] + "·" + S.STEM[bs] + " 충(沖) — 부딪히는 글자");
    if (tags.indexOf("육합") >= 0) basis.push("일지 " + S.BRANCH[ab] + "·" + S.BRANCH[bb] + " 육합(六合) — 서로 맞물리는 자리");
    if (tags.some(function (t) { return t.indexOf("삼합") === 0; })) basis.push("일지 " + S.BRANCH[ab] + "·" + S.BRANCH[bb] + " 삼합(三合) — 손발이 맞는 자리");
    if (tags.indexOf("충") >= 0) basis.push("일지 " + S.BRANCH[ab] + "·" + S.BRANCH[bb] + " 충(沖) — 정면으로 부딪히는 자리");
    if (tags.indexOf("형") >= 0) basis.push("일지 형(刑) — 꼬이기 쉬운 자리");
    if (tags.indexOf("파") >= 0) basis.push("일지 파(破) — 말이 어긋나기 쉬운 자리");
    if (tags.indexOf("해") >= 0) basis.push("일지 해(害) — 서운함이 쌓이기 쉬운 자리");
    if (boanA + boanB >= 4) basis.push("오행 보완 — 서로 없는 기운을 채워 줌");
    basis.push("상대는 내게 ‘" + god + "’의 기운");

    /* 문안 */
    var chemi = [T.intro, band.line];
    var factorLine = stemHap || branchHap > 0
      ? "두 사람 글자에 합이 있어요. 말이 통하는 순간이 자주 오고, 함께 있을 때 일이 자연스럽게 풀려요."
      : (boanA + boanB >= 4
        ? "서로에게 없는 오행을 채워 주는 사이예요. 내가 약한 부분을 상대가 자연스럽게 메워 줘요."
        : (er === "saeng" || er === "saengRev"
          ? "한쪽이 다른 쪽을 살리는 상생의 기운이에요. 챙겨 주는 쪽과 받는 쪽이 자연스럽게 나뉘어요."
          : (badPts < -4
            ? "서로를 자극하는 글자가 있어요. 끌리는 만큼 부딪히는 지점도 분명해요. 역할을 나누면 오히려 강해져요."
            : "특별히 얽히는 글자는 없어요. 관계를 만드는 건 사주보다 대화예요.")));
    chemi.push(factorLine);

    /* 잘 맞는 점 */
    var good = [];
    if (stemHap || branchHap > 0) good.push("말이 통하는 순간이 자주 와요. 설명을 길게 하지 않아도 알아듣는 편이에요.");
    if (er === "saengRev") good.push("상대가 내 빈 곳을 먼저 채워 줘요. 챙김을 당연하게 여기지 않으면 오래가요.");
    if (er === "saeng") good.push("내가 상대를 살려 주는 사이예요. 내가 먼저 챙길 때 관계가 안정돼요.");
    if (boanA + boanB >= 4) good.push("서로에게 없는 기운을 가졌어요. 같이 있으면 내 약한 부분이 덜 드러나요.");
    if (er === "same") good.push("닮은 곳이 많아 편해요. 취향과 리듬이 비슷해서 같이 있으면 시간이 빨리 가요.");
    if (T.key === "work" && (god === "정관" || god === "정인" || god === "정재")) good.push("역할이 잘 나뉘어요. 한 사람이 기획하면 다른 사람이 마무리하는 식으로 맞물려요.");
    if (!good.length) good.push("서로 다른 걸 가졌다는 게 강점이에요. 내가 못 보는 걸 상대가 봐 줘요.");
    if (good.length < 2) good.push("같이 있을 때 긴장이 덜해요. 편하게 쉬었다 갈 수 있는 사이예요.");
    good = good.slice(0, 3);

    /* 조심할 점 */
    var caution = [];
    if (tags.indexOf("충") >= 0) caution.push("부딪히면 크게 부딪히는 편이에요. 말이 올라올 때 30분만 쉬었다 하세요.");
    if (tags.indexOf("형") >= 0) caution.push("꼬이면 오래 끌어요. 같은 문제로 두 번 얘기하게 되면 규칙을 하나 만드세요.");
    if (tags.indexOf("파") >= 0) caution.push("사소한 말이 어긋나기 쉬워요. 문자로 넘기지 말고 얼굴 보고 말하세요.");
    if (tags.indexOf("해") >= 0) caution.push("은근한 서운함이 쌓여요. 괜찮은 척하지 말고 짧게라도 말하세요.");
    if (er === "geuk" || er === "geukRev") caution.push("주도권 다툼이 생기기 쉬워요. 역할을 미리 나누면 훨씬 편해져요.");
    caution.push("기대하는 표현 방식이 달라요. ‘나는 이렇게 받으면 좋아’를 말로 알려 주세요.");
    if (caution.length < 2) caution.push("좋아하는 방식이 달라서, 표현을 그대로 받아들이면 오해가 생길 수 있어요.");
    caution = caution.slice(0, 3);

    /* 한 줄 요약 */
    var oneLine;
    if ((stemHap || branchHap > 0) && score >= 74) oneLine = "끌림과 편안함이 같이 있는 사이";
    else if (stemHap || branchHap > 0) oneLine = "끌림은 세지만 속도를 맞춰야 하는 사이";
    else if (boanA + boanB >= 4 && score >= 64) oneLine = "서로의 빈 곳을 채워 주는 사이";
    else if (boanA + boanB >= 4) oneLine = "다르지만 서로를 채워 주는 사이";
    else if (er === "saeng" || er === "saengRev") oneLine = "한쪽이 다른 쪽을 살려 주는 사이";
    else if ((tags.indexOf("충") >= 0 || stemChung) && score >= 64) oneLine = "부딪히지만 그만큼 뜨거운 사이";
    else if (tags.indexOf("충") >= 0 || stemChung) oneLine = "가까울수록 부딪히는 사이";
    else if (er === "geuk" || er === "geukRev") oneLine = "끌리지만 주도권이 부딪히는 사이";
    else if (er === "same") oneLine = "닮아서 편하고, 닮아서 부딪히는 사이";
    else oneLine = "천천히 알아 갈수록 좋아지는 사이";

    var nameA = (a.input && a.input.name) || "나";
    var nameB = (b.input && b.input.name) || "상대";

    return {
      type: T,
      score: score,
      band: band,
      summary: oneLine,
      headline: nameA + " × " + nameB + " — " + score + "% · " + oneLine,
      basis: basis,
      chemi: chemi,
      good: good,
      caution: caution,
      names: { a: nameA, b: nameB },
      detail: { elemRel: er, stemHap: stemHap, stemChung: stemChung, tags: tags, god: god, boan: boanA + boanB },
      charA: global.SAJU_DAILY.character(a),
      charB: global.SAJU_DAILY.character(b)
    };
  }

  function shareText(a, b, r) {
    var S = global.SAJU;
    var L = [];
    L.push(r.type.emoji + " " + r.type.label + " 궁합 · " + r.names.a + " × " + r.names.b);
    L.push("결과는 " + r.score + "% — " + r.band.label);
    L.push("“" + r.summary + "”");
    L.push("");
    L.push("· " + r.names.a + " " + r.charA.emoji + " " + r.charA.name + " (" + S.STEM[a.pillars.day.stem] + S.BRANCH[a.pillars.day.branch] + "일주)");
    L.push("· " + r.names.b + " " + r.charB.emoji + " " + r.charB.name + " (" + S.STEM[b.pillars.day.stem] + S.BRANCH[b.pillars.day.branch] + "일주)");
    L.push("");
    L.push("✔ 잘 맞는 점");
    r.good.forEach(function (g) { L.push("· " + g); });
    L.push("⚠ 조심할 점");
    r.caution.slice(0, 2).forEach(function (c) { L.push("· " + c); });
    L.push("");
    L.push("https://econature7-lab.github.io/nori-apps/saju/#compat");
    return L.join("\n");
  }

  global.SAJU_COMPAT = {
    TYPES: TYPES,
    compute: compute,
    shareText: shareText,
    elemRel: elemRel
  };
})(window);
