/* ─────────────────────────────────────────────────────────────
   saju-daily.js — MZ 캐릭터 유형 · 오늘의 운세 (일진 기반)
   · 오늘 날짜는 Asia/Seoul 기준
   · 내 일간과 오늘 일진(천간·지지)의 십성·합충·12운성으로 하루 운세를 만듭니다.
   · 모든 계산은 브라우저 안에서만 (서버 전송 없음)
   ───────────────────────────────────────────────────────────── */
(function (global) {
  "use strict";

  /* ── MZ 캐릭터 유형 (일간 10) ──────────────────────── */
  var CHARACTER = [
    {
      emoji: "🌳", name: "숲의 리더형", code: "FOREST-LEADER",
      tags: ["#정면돌파", "#원칙", "#큰그루"],
      shine: "빛나는 순간 — 새 판을 열어야 할 때예요. 기준을 세우고 첫 삽을 뜨는 자리에서 제일 셉니다.",
      chemi: "물(水)을 만나면 더 크게 자라고, 같은 목(木)끼리는 숲이 돼요. 금(金)과는 톱날 대 나무라 서로 조심."
    },
    {
      emoji: "🌿", name: "덩굴 전략가형", code: "VINE-TACTIC",
      tags: ["#눈치빠름", "#조율", "#부드러운야망"],
      shine: "빛나는 순간 — 사람 사이가 꼬였을 때예요. 정면 대결 대신 옆으로 들어가 풀어내요.",
      chemi: "불(火)을 만나면 재주가 빛나고, 같은 목(木)과는 편해요. 흙(土)이 많으면 답답해질 수 있어요."
    },
    {
      emoji: "☀️", name: "햇살 텐션형", code: "SUNSHINE-HYPE",
      tags: ["#분위기메이커", "#순발력", "#무한연료"],
      shine: "빛나는 순간 — 분위기가 가라앉았을 때예요. 존재만으로 방 안 온도를 올려요.",
      chemi: "나무(木)가 불을 키워 주고, 같은 화(火)끼리는 무대가 넓어져요. 물(水)이 많으면 기세가 눌려요."
    },
    {
      emoji: "🕯️", name: "촛불 다정형", code: "CANDLE-HEART",
      tags: ["#섬세", "#한결같음", "#디테일"],
      shine: "빛나는 순간 — 디테일이 생사를 가를 때예요. 남들이 놓친 한 끗을 봐요.",
      chemi: "나무(木)가 불을 오래 살려 주고, 같은 화(火)와는 온도가 맞아요. 물(水)과는 서로의 속도를 이해해야 해요."
    },
    {
      emoji: "⛰️", name: "산 같은 중심형", code: "MOUNTAIN-CORE",
      tags: ["#든든함", "#버티기", "#무게감"],
      shine: "빛나는 순간 — 판이 흔들릴 때예요. 자리를 지키는 것만으로 힘이 돼요.",
      chemi: "불(火)이 산을 밝혀 주고, 같은 토(土)끼리는 든든해요. 나무(木)가 많으면 산이 파여요."
    },
    {
      emoji: "🌾", name: "밭 같은 실속형", code: "FIELD-KEEPER",
      tags: ["#실속", "#돌봄", "#조용한정리"],
      shine: "빛나는 순간 — 사람을 키워야 할 때예요. 조용히 다져서 남기는 데 능해요.",
      chemi: "불(火)이 밭을 데워 주고, 같은 토(土)와는 안정적이에요. 나무(木)가 많으면 할 일이 늘어나요."
    },
    {
      emoji: "⚔️", name: "칼같은 결단형", code: "BLADE-DECIDER",
      tags: ["#결단", "#직진", "#뒤끝없음"],
      shine: "빛나는 순간 — 결정이 안 날 때예요. 칼을 뽑아야 할 순간에 제일 빨라요.",
      chemi: "흙(土)이 칼을 만들어 주고, 같은 금(金)끼리는 판이 커져요. 불(火)이 많으면 칼날이 무뎌져요."
    },
    {
      emoji: "💎", name: "보석 디테일형", code: "GEM-DETAIL",
      tags: ["#완성도", "#취향", "#까다로운안목"],
      shine: "빛나는 순간 — 완성도를 올려야 할 때예요. 대충 넘어가는 걸 못 견디는 사람이에요.",
      chemi: "흙(土)이 보석을 감싸 주고, 같은 금(金)과는 취향이 맞아요. 불(火)이 많으면 예민함이 올라와요."
    },
    {
      emoji: "🌊", name: "큰물 스케일형", code: "BIGWAVE-SCALE",
      tags: ["#큰그림", "#네트워킹", "#흐름타기"],
      shine: "빛나는 순간 — 판을 키워야 할 때예요. 큰 그림을 그리고 사람을 모아요.",
      chemi: "금(金)이 물을 길어 주고, 같은 수(水)끼리는 판이 넓어져요. 흙(土)이 많으면 길이 막혀요."
    },
    {
      emoji: "💧", name: "물빛 관찰형", code: "WATER-READER",
      tags: ["#직관", "#공감", "#조용한집념"],
      shine: "빛나는 순간 — 마음을 읽어야 할 때예요. 말하지 않은 것까지 들여다봐요.",
      chemi: "금(金)이 물을 맑게 해 주고, 같은 수(水)와는 말이 통해요. 흙(土)이 많으면 속이 무거워져요."
    }
  ];

  /* ── 오늘의 십성 문안 ─────────────────────────────── */
  var TODAY_GOD = {
    "비견": {
      kw: "내 페이스",
      head: "내 일은 내가 정하는 날",
      money: "돈은 내 판단으로 움직여요. 남 따라가기보다 내 지출 기준을 먼저 세워 보세요.",
      love: "비슷한 처지라 편해요. 다만 서로 양보가 없으면 팽팽해져요.",
      work: "혼자 밀고 나가기 좋아요. 남에게 미룰 일도 오늘은 내가 끝내면 개운해요.",
      advice: "남의 속도 말고 내 속도로 한 칸."
    },
    "겁재": {
      kw: "경쟁",
      head: "기회도 사람도 몰리는 날",
      money: "쓰는 돈이 늘어요. 큰 결제는 내일로 미루면 절반은 안 하게 돼요.",
      love: "인기가 오르지만 마음이 갈라지기 쉬워요. 오늘은 한 사람만 보세요.",
      work: "경쟁·제안에서 내 실력이 드러나요. 조건은 꼭 확인하고 움직이세요.",
      advice: "베풀되 내 몫은 챙기세요."
    },
    "식신": {
      kw: "여유",
      head: "잘 먹고 잘 만드는 날",
      money: "작게 버는 재미가 있어요. 취미가 용돈이 되는 시도에 좋아요.",
      love: "같이 먹고 걷는 데서 마음이 가까워져요. 거창한 이벤트보다 편한 자리가 좋아요.",
      work: "콘텐츠·기획처럼 내 색을 내는 일에서 반응이 와요.",
      advice: "오늘은 ‘맛있게’가 곧 능력이에요."
    },
    "상관": {
      kw: "표현",
      head: "말과 재주가 튀는 날",
      money: "재주로 버는 돈이 생겨요. 구두 약속은 돈이 아니에요.",
      love: "재치가 통하지만 말이 세지면 상대가 지쳐요. 한 번은 진심만 말하세요.",
      work: "발표·제안·SNS에서 눈에 띄어요. 윗사람 앞에서는 말투만 조심하세요.",
      advice: "하고 싶은 말의 70%만 꺼내도 충분해요."
    },
    "편재": {
      kw: "활동",
      head: "돈이 도는 판에 끼는 날",
      money: "들어오는 길도 넓지만 새는 곳도 넓어요. 쓴 돈은 그 자리에서 적어 두세요.",
      love: "설렘이 오는 날이에요. 새로운 인연보다 지금 인연을 챙기면 복이 돼요.",
      work: "영업·거래·외근처럼 사람 만나는 일에서 성과가 나요.",
      advice: "오늘 번 돈의 30%는 손대지 마세요."
    },
    "정재": {
      kw: "실속",
      head: "차곡차곡 쌓이는 날",
      money: "저축·정산·청약에 좋아요. 확인 안 한 자동결제를 오늘 정리해 보세요.",
      love: "약속을 지키는 모습이 고백보다 세요. 작은 약속 하나를 꼭 지키세요.",
      work: "맡은 일의 완성도가 평가로 이어져요. 한 일은 기록으로 남기세요.",
      advice: "오늘은 ‘정확하게’가 ‘빨리’를 이겨요."
    },
    "편관": {
      kw: "압박",
      head: "숨은 차지만 실력이 오르는 날",
      money: "예상 밖 지출이 생길 수 있어요. 비상금부터 확인하세요.",
      love: "강한 사람에게 끌려요. 리드당하는 것과 존중받는 것은 달라요.",
      work: "책임이 늘고 평가가 엄격해요. 버티면 한 단계 올라가요.",
      advice: "긴장은 10분 호흡으로 풀고, 결정은 하나만 하세요."
    },
    "정관": {
      kw: "질서",
      head: "자리가 잡히는 날",
      money: "급여·정산·계약처럼 정해진 돈이 안정적이에요. 조건을 다시 보면 더 받아요.",
      love: "관계를 공식화하기 좋은 날. 소개·가족 자리가 도움이 돼요.",
      work: "시험·서류·마감에 유리해요. 마감 시간은 절대 놓치지 마세요.",
      advice: "오늘은 규칙을 지키는 쪽이 빠릅니다."
    },
    "편인": {
      kw: "몰입",
      head: "혼자 파고들기 좋은 날",
      money: "공부·자격에 쓴 돈이 남아요. 충동 결제보다 쓸모로 고르세요.",
      love: "마음을 다 보여 주기 어려운 날이에요. 한 마디만 더 하면 풀려요.",
      work: "기획·연구·정리처럼 혼자 몰입하는 일이 잘 돼요.",
      advice: "생각이 길어지면 30분 안에 하나만 실행하세요."
    },
    "정인": {
      kw: "도움",
      head: "도움과 배움이 들어오는 날",
      money: "지원·환급·윗사람 도움처럼 들어오는 돈이 있어요. 신청할 게 있으면 오늘 하세요.",
      love: "따뜻하게 챙겨 주는 사람과 인연이 닿아요. 받는 것도 연습이에요.",
      work: "추천·교육·멘토링에서 기회가 와요. 물어보면 길이 열려요.",
      advice: "오늘은 혼자 하지 말고 한 사람에게 물어보세요."
    }
  };

  /* ── 오늘 일진과 내 일지의 관계 ───────────────────── */
  var TODAY_REL = {
    "자형": "오늘 일진이 내 일지와 같은 글자로 겹쳐요. 스스로에게 엄격해지기 쉬운 날이니 자기 채찍질은 내일로 미루세요.",
    "충": "오늘 일진이 내 일지와 정면으로 부딪혀요. 약속 변경·이동·말실수가 생기기 쉬우니 한 박자 여유를 두세요.",
    "형": "꼬이는 기운이 있어요. 같은 실수를 반복하지 않게 한 번 더 확인하세요.",
    "파": "말이 어긋나기 쉬운 날이에요. 메시지는 보내기 전에 한 번 더 읽어 보세요.",
    "해": "은근한 서운함이 쌓이기 쉬워요. 혼자 삭히지 말고 가볍게 말해 보세요.",
    "육합": "오늘 일진이 내 일지와 맞물려요. 사람을 만나는 자리에서 좋은 기운이 와요.",
    "삼합": "오늘 일진이 내 일지와 손을 잡아요. 같이 하는 일이 혼자 할 때보다 잘 풀려요.",
    "동일": "오늘 일진이 내 일지와 같은 기운이에요. 내 색이 진해지는 날이라 밀어붙여도 좋아요. 다만 고집은 반 박자만 늦추세요.",
    "무관": "특별히 부딪히거나 얽히는 자리는 없어요. 평소 하던 대로 하면 됩니다."
  };

  /* ── 등급 ─────────────────────────────────────────── */
  var GRADES = [
    { min: 88, label: "최상", head: "오늘은 흐름이 나를 밀어 줘요", line: "미뤄 둔 일을 꺼내기 좋은 날. 먼저 움직이면 결과가 따라와요." },
    { min: 78, label: "좋음", head: "기분 좋게 풀리는 하루", line: "하고 싶던 말 한마디, 미뤄 둔 연락 하나를 오늘 꺼내 보세요." },
    { min: 68, label: "무난", head: "평소대로면 충분한 날", line: "크게 벌이지 말고 하던 일을 제대로 마무리하는 데 쓰면 좋아요." },
    { min: 58, label: "주의", head: "한 박자 천천히 가는 날", line: "속도를 줄이면 탈이 없어요. 결정은 하루 묵혔다 해도 늦지 않아요." },
    { min: 0, label: "휴식", head: "오늘은 채우는 날", line: "애써 밀지 않아도 돼요. 몸과 마음을 채우면 내일이 빨라져요." }
  ];

  var WEEK = ["일", "월", "화", "수", "목", "금", "토"];

  /* ── 날짜 ─────────────────────────────────────────── */
  function pad(n) { return ("0" + n).slice(-2); }

  function todayKST(now) {
    var t = (now || new Date()).getTime() + 9 * 3600 * 1000;  // KST = UTC+9
    var d = new Date(t);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() };
  }
  function dateLabel(date) {
    return date.y + "." + pad(date.m) + "." + pad(date.d) + " (" + WEEK[date.wd] + ")";
  }

  /* ── 캐릭터 ───────────────────────────────────────── */
  function character(res) {
    var S = global.SAJU;
    var c = CHARACTER[res.dayMaster.stem];
    var strength = res.strength === "strong" ? "기운이 넘치는" : (res.strength === "weak" ? "받쳐 줘야 빛나는" : "균형 잡힌");
    return {
      emoji: c.emoji, name: c.name,
      code: c.code + (res.strength === "strong" ? "-S" : (res.strength === "weak" ? "-W" : "-B")),
      tags: c.tags, shine: c.shine, chemi: c.chemi,
      stem: S.STEM[res.dayMaster.stem] + "(" + S.STEM_H[res.dayMaster.stem] + ")",
      elem: S.ELEM[res.dayMaster.elem],
      strength: strength,
      oneLine: c.emoji + " " + c.name + " · " + c.tags[0]
    };
  }

  /* ── 오늘의 운세 ──────────────────────────────────── */
  var MONEY = { "비견": 62, "겁재": 46, "식신": 74, "상관": 70, "편재": 84, "정재": 82, "편관": 54, "정관": 72, "편인": 56, "정인": 70 };
  var LOVE = { "비견": 62, "겁재": 50, "식신": 72, "상관": 58, "편재": 78, "정재": 74, "편관": 60, "정관": 80, "편인": 52, "정인": 76 };
  var WORK = { "비견": 68, "겁재": 60, "식신": 74, "상관": 70, "편재": 72, "정재": 78, "편관": 62, "정관": 84, "편인": 70, "정인": 78 };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

  function primaryRelation(tags, br, myBranch) {
    if (tags.indexOf("자형") >= 0) return "자형";
    if (tags.indexOf("충") >= 0) return "충";
    if (tags.indexOf("형") >= 0) return "형";
    if (tags.indexOf("파") >= 0) return "파";
    if (tags.indexOf("해") >= 0) return "해";
    if (tags.indexOf("육합") >= 0) return "육합";
    if (tags.some(function (t) { return t.indexOf("삼합") === 0; })) return "삼합";
    if (br === myBranch) return "동일";
    return "무관";
  }

  function relScore(prim) {
    return {
      "자형": 44, "충": 34, "형": 46, "파": 50, "해": 52,
      "육합": 82, "삼합": 80, "동일": 66, "무관": 62
    }[prim];
  }

  function compute(res, date) {
    var S = global.SAJU, C = global.SAJU_CONTENT;
    date = date || todayKST();
    var gz = S.gzIndexOfDate(date.y, date.m, date.d);
    var st = ((gz % 10) + 10) % 10, br = ((gz % 12) + 12) % 12;
    var myElem = res.dayMaster.elem, myYang = res.dayMaster.yang;
    var tenStem = S.tenGod(myElem, myYang, S.STEM_ELEM[st], st % 2 === 0);
    var tenBr = S.tenGod(myElem, myYang, S.BRANCH_ELEM[br], false);
    var tags = S.relation(br, res.pillars.day.branch);
    var prim = primaryRelation(tags, br, res.pillars.day.branch);
    var rs = relScore(prim);
    var tg = TODAY_GOD[tenStem] || TODAY_GOD["비견"];

    var seed = S.jdn(date.y, date.m, date.d);
    var n1 = (seed + st * 3 + br * 5) % 11 - 5;
    var n2 = (seed + st * 7 + br * 2 + 4) % 11 - 5;
    var n3 = (seed + st * 5 + br * 9 + 8) % 11 - 5;

    var money = clamp(0.64 * MONEY[tenStem] + 0.36 * rs + n1, 30, 97);
    var love = clamp(0.64 * LOVE[tenStem] + 0.36 * rs + n2, 30, 97);
    var work = clamp(0.64 * WORK[tenStem] + 0.36 * rs + n3, 30, 97);
    var total = clamp((money + love + work) / 3 + (rs - 62) * 0.25, 30, 97);

    var grade = GRADES[GRADES.length - 1];
    for (var i = 0; i < GRADES.length; i++) { if (total >= GRADES[i].min) { grade = GRADES[i]; break; } }

    /* 행운: 나를 도와주는 오행(인성)과 부족한 오행 중 하루씩 번갈아 */
    var resource = (myElem + 4) % 5;
    var luckyElem = (seed % 2 === 0) ? resource : res.weakest;
    if (res.counts[luckyElem] >= 4) luckyElem = res.weakest;
    var lk = C.LUCKY[luckyElem];
    var luckyNum = [((gz + 3) % 9) + 1, ((gz + 7) % 9) + 1];
    if (luckyNum[1] === luckyNum[0]) luckyNum[1] = (luckyNum[1] % 9) + 1;

    return {
      date: { y: date.y, m: date.m, d: date.d, wd: date.wd },
      dateLabel: dateLabel(date),
      weekday: WEEK[date.wd] + "요일",
      iso: date.y + "-" + pad(date.m) + "-" + pad(date.d),
      gz: { stem: st, branch: br, name: S.STEM[st] + S.BRANCH[br], hanja: S.STEM_H[st] + S.BRANCH_H[br] },
      stemElem: S.STEM_ELEM[st], branchElem: S.BRANCH_ELEM[br],
      tenStem: tenStem, tenBranch: tenBr,
      wunseong: S.wunseong(res.dayMaster.stem, br),
      relTags: tags, relPrim: prim,
      god: tg, grade: grade,
      scores: { total: total, money: money, love: love, work: work },
      relationLine: TODAY_REL[prim],
      advice: tg.advice,
      lucky: { elem: S.ELEM[luckyElem], hanja: ["木", "火", "土", "金", "水"][luckyElem], color: lk.color, hex: lk.hex, items: lk.items, number: luckyNum },
      character: character(res)
    };
  }

  /* ── 공유용 텍스트 ────────────────────────────────── */
  function shareText(res, f, name) {
    var nm = name || (res.input && res.input.name) || "";
    var who = nm ? nm + " 님" : "내";
    var L = [];
    L.push("🔮 오늘의 운세 · " + f.dateLabel);
    L.push(who + " 캐릭터는 " + f.character.emoji + " " + f.character.name);
    L.push("");
    L.push("총운 " + f.scores.total + "점 · " + f.grade.label + " — " + f.grade.head);
    L.push("· 금전 " + f.scores.money + " · 연애 " + f.scores.love + " · 일·학업 " + f.scores.work);
    L.push("일진 " + f.gz.name + "(" + f.gz.hanja + ")일 · " + f.tenStem);
    L.push("");
    L.push("💡 " + f.advice);
    L.push("🍀 행운 컬러 " + f.lucky.color + " · 숫자 " + f.lucky.number.join(", "));
    L.push("");
    L.push("https://econature7-lab.github.io/nori-apps/saju/#today");
    return L.join("\n");
  }

  global.SAJU_DAILY = {
    CHARACTER: CHARACTER,
    TODAY_GOD: TODAY_GOD,
    compute: compute,
    character: character,
    todayKST: todayKST,
    dateLabel: dateLabel,
    shareText: shareText
  };
})(window);
