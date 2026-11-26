/* ─────────────────────────────────────────────────────────────
   saju-content.js — 문안 테이블 · 결과 조립
   계산값(사주·오행·십성·토정비결 괘)을 읽어 화면에 쓸 글을 만듭니다.
   운세 문안은 재미와 자기 점검용입니다.
   ───────────────────────────────────────────────────────────── */
(function (global) {
  "use strict";

  var ELEM_COLOR = ["#6FA98C", "#C9614F", "#C0A16B", "#9AA7B8", "#5D7DA8"];
  var ELEM_NAME_H = ["木", "火", "土", "金", "水"];
  var ELEM_HANJA_COLOR = ["목", "화", "토", "금", "수"];

  /* ── 일간 10 ─────────────────────────────────────── */
  var STEM_PROFILE = [
    { /* 갑 甲 목 */
      title: "곧게 뻗는 숲의 개척자",
      tag: "정면돌파 · 원칙 · 성장",
      body: "한번 정한 방향으로 곧게 자라는 나무처럼, 앞에 장애물이 있어도 돌아가기보다 뚫고 가는 편이에요. 겉은 무던해 보여도 속엔 ‘이건 이래야 한다’는 기준이 또렷해요.",
      good: ["시작하는 힘", "책임감", "긴 호흡"],
      bad: "휘어지는 걸 못 견뎌서, 상대의 사정을 기다려 주는 연습이 필요해요.",
      work: "새 판을 여는 일, 기준을 세우는 일"
    },
    { /* 을 乙 목 */
      title: "휘어야 살아남는 덩굴형 전략가",
      tag: "유연 · 감각 · 잔머리(좋은 쪽)",
      body: "곧게 밀어붙이기보다 상황을 읽고 슬쩍 비껴가며 목적지에 닿는 타입이에요. 부드러운 말투 뒤에 계산이 빠르고, 사람 마음의 결을 잘 읽어요.",
      good: ["눈치", "조율", "끈질김"],
      bad: "맞춰 주다가 내 속을 말하지 않아 서운해지는 일이 생겨요.",
      work: "기획·중재·감각이 필요한 일"
    },
    { /* 병 丙 화 */
      title: "한낮을 밝히는 불꽃 기획자",
      tag: "열정 · 표현 · 추진",
      body: "태양처럼 존재 자체가 밝아서, 어디서든 분위기를 끌어올려요. 좋아하는 일엔 연료가 무한하지만, 싫증이 오면 온도가 확 꺼지는 게 약점이에요.",
      good: ["순발력", "설득", "분위기"],
      bad: "시작만 하고 마무리를 남에게 넘기기 쉬워요.",
      work: "런칭·영업·무대가 있는 일"
    },
    { /* 정 丁 화 */
      title: "오래 타는 촛불형 감성 설계자",
      tag: "섬세 · 집중 · 애정",
      body: "확 타오르진 않지만 한번 붙으면 오래 가는 불이에요. 사람과 일에 정을 붙이고, 디테일에서 남들이 못 보는 걸 봐요. 대신 상처도 오래 기억해요.",
      good: ["집중력", "다정함", "완성도"],
      bad: "서운한 걸 쌓아 두다가 한 번에 터뜨리는 패턴을 조심하세요.",
      work: "콘텐츠·디자인·돌봄이 필요한 일"
    },
    { /* 무 戊 토 */
      title: "판을 지키는 산 같은 중심",
      tag: "안정 · 신뢰 · 버티기",
      body: "주변이 흔들려도 쉽게 자리를 옮기지 않는 산 같은 사람이에요. 말수는 적어도 결정적인 순간에 무게를 잡아 주고, 사람들이 자연스럽게 기대게 돼요.",
      good: ["신용", "담대함", "관리"],
      bad: "변화가 늦고, 고집이 ‘원칙’으로 포장되기 쉬워요.",
      work: "운영·관리·조직을 세우는 일"
    },
    { /* 기 己 토 */
      title: "키워서 남기는 밭 같은 실속러",
      tag: "실용 · 배려 · 축적",
      body: "화려한 것보다 실제로 남는 걸 챙겨요. 사람을 키우고 일을 다지는 데 능하고, 겉으로 드러나지 않게 판을 정리해 두는 타입이에요.",
      good: ["현실감각", "돌봄", "정리"],
      bad: "속마음을 잘 안 보여 줘서 계산적으로 보일 수 있어요.",
      work: "교육·기획관리·살림형 사업"
    },
    { /* 경 庚 금 */
      title: "칼같이 끊고 정리하는 결단러",
      tag: "결단 · 추진 · 명확",
      body: "애매한 걸 못 견디고, 결정해야 할 때 가장 빨리 칼을 뽑아요. 직설적이지만 뒤끝이 없고, 위기 상황에서 오히려 가장 침착해요.",
      good: ["실행력", "위기대응", "솔직함"],
      bad: "말이 세서 상처를 남길 수 있어요. 한 박자 눌러 말하기.",
      work: "영업·개척·구조를 바꾸는 일"
    },
    { /* 신 辛 금 */
      title: "보석처럼 다듬는 디테일 장인",
      tag: "완성도 · 취향 · 섬세",
      body: "대충 넘어가는 걸 못 견디는 미감이 있어요. 사람과 일을 까다롭게 고르는 대신, 고른 것엔 끝까지 정성을 쏟아요. 예민함이 곧 실력이에요.",
      good: ["미적 감각", "집요함", "정확"],
      bad: "완벽하지 않으면 시작을 미루다가 타이밍을 놓칠 수 있어요.",
      work: "브랜딩·편집·전문직"
    },
    { /* 임 壬 수 */
      title: "큰물처럼 흐르는 스케일 메이커",
      tag: "확장 · 유동 · 포용",
      body: "물이 낮은 곳으로 흐르며 큰 강이 되듯, 판을 크게 보고 사람을 넓게 받아들여요. 아이디어가 많고 흐름을 타는 감각이 뛰어나요.",
      good: ["큰 그림", "적응력", "네트워킹"],
      bad: "벌여 놓은 게 많아 마무리가 흩어지기 쉬워요.",
      work: "사업·콘텐츠·사람을 잇는 일"
    },
    { /* 계 癸 수 */
      title: "스며들어 읽는 물 같은 관찰자",
      tag: "직관 · 공감 · 집요함",
      body: "조용히 스며들어 사람과 상황을 읽는 힘이 있어요. 티는 안 내지만 속으론 다 계산하고 있고, 한번 마음먹으면 물이 바위를 뚫듯 오래 가요.",
      good: ["직관", "공감", "집념"],
      bad: "혼자 삭히는 시간이 길어지면 생각이 깊어지는 게 아니라 무거워져요.",
      work: "상담·분석·글쓰기"
    }
  ];

  /* ── 지지 12 ─────────────────────────────────────── */
  var BRANCH_PROFILE = [
    { kw: "밤의 물", line: "머리 회전이 빠르고, 남이 자는 시간에 답을 찾는 타입" },
    { kw: "겨울 밭", line: "느려 보여도 끝까지 남아 결과를 챙기는 끈기" },
    { kw: "새벽 숲", line: "먼저 나가 길을 여는 개척 본능" },
    { kw: "봄풀", line: "부드럽게 파고들어 결국 자리를 만드는 감각" },
    { kw: "용의 못", line: "평범해 보이다 결정적 순간에 판을 바꾸는 힘" },
    { kw: "한낮의 열", line: "직감이 빠르고, 눈에 띄는 재주가 있는 사람" },
    { kw: "정오의 태양", line: "숨길 수 없는 존재감과 경쟁심" },
    { kw: "늦여름 밭", line: "사람과 분위기를 익혀 판을 무르익게 하는 조율" },
    { kw: "가을 칼", line: "군더더기 없이 정리하는 결단" },
    { kw: "다듬은 보석", line: "취향과 완성도에 대한 타협 없는 기준" },
    { kw: "충견", line: "의리와 책임, 한번 맺은 관계는 오래 감" },
    { kw: "겨울 바다", line: "넓게 품으면서도 속을 다 보여 주지 않는 깊이" }
  ];

  /* ── 오행 5 ──────────────────────────────────────── */
  var ELEM_PROFILE = [
    { name: "목", h: "木", color: "#6FA98C", word: "시작·성장", over: "추진력은 좋지만 조급함이 앞서요. 벌인 일을 줄이고 순서를 정하세요.", under: "시작하는 힘이 약해요. 작은 결심을 눈에 보이게 적어 두면 힘이 붙어요." },
    { name: "화", h: "火", color: "#C9614F", word: "표현·열정", over: "감정 기복이 크고 말이 앞서요. 결정은 하루 묵혔다 하세요.", under: "속으로만 끓어요. 좋아하는 걸 말로 꺼내는 연습이 필요해요." },
    { name: "토", h: "土", color: "#C0A16B", word: "중심·안정", over: "안정에 기대다 기회를 놓칠 수 있어요. 한 번은 움직이세요.", under: "기반이 흔들리기 쉬워요. 규칙적인 생활 하나가 큰 버팀목이 돼요." },
    { name: "금", h: "金", color: "#9AA7B8", word: "정리·결단", over: "기준이 칼처럼 날카로워요. 사람에게는 조금 무디게 굴어도 괜찮아요.", under: "끊고 정리하는 힘이 약해요. 안 쓰는 것부터 버리는 연습이 좋아요." },
    { name: "수", h: "水", color: "#5D7DA8", word: "지혜·유연", over: "생각이 많아 실행이 늦어요. 70%면 시작하세요.", under: "쉬어야 채워져요. 혼자 있는 시간을 일정에 넣어 두세요." }
  ];

  /* 십성 10 — 2027 세운의 표면 기운 */
  var TENGOD_PROFILE = {
    "비견": {
      kw: "내 힘으로 미는 해",
      line: "내 이름으로 결정하고 내 손으로 만드는 한 해예요. 남이 세워 준 판보다 내가 세운 판에서 성과가 나요.",
      money: "공동 지출·동업에서 계산이 흐려지기 쉬워요. 돈 얘기는 처음에 문서로 남기세요.",
      love: "내 페이스를 존중해 주는 사람과 잘 맞아요. 주도권 다툼이 애정 싸움으로 번지지 않게.",
      work: "독립·부업·새 프로젝트처럼 ‘내 것’이 되는 일에 기회가 있어요.",
      health: "혼자 다 짊어지면 어깨와 목이 먼저 굳어요. 힘 빼는 시간을 정해 두세요."
    },
    "겁재": {
      kw: "사람과 판이 겹치는 해",
      line: "기회도 사람도 몰려오는 해예요. 같이 하면 커지지만, 경쟁자도 같이 늘어나요.",
      money: "들어오는 만큼 나가기 쉬워요. 큰 지출은 하루 미루는 규칙 하나로 막을 수 있어요.",
      love: "인기운은 있지만 관계가 복잡해질 수 있어요. 선을 긋는 게 매력이에요.",
      work: "협업·제안·경쟁 입찰에서 실력이 드러나요. 조건은 꼭 확인하세요.",
      health: "모임이 늘면 수면이 줄어요. 잠이 가장 큰 재물인 해예요."
    },
    "식신": {
      kw: "내 속도로 즐기는 해",
      line: "억지로 밀기보다 재미있는 쪽으로 흐를 때 성과가 커지는 해예요. 먹고 만들고 기록하는 일이 운을 열어요.",
      money: "작지만 꾸준한 수입이 붙어요. 취미가 용돈벌이가 되는 시도에 좋아요.",
      love: "편안함이 매력으로 보이는 해예요. 같이 먹고 걷는 데서 관계가 깊어져요.",
      work: "콘텐츠·교육·기획처럼 내 색을 내는 일에서 반응이 와요.",
      health: "식욕이 늘기 쉬워요. 맛있는 건 즐기되 저녁 양만 조금 줄이세요."
    },
    "상관": {
      kw: "말과 재주가 튀는 해",
      line: "아이디어와 표현이 살아나는 대신, 말이 세게 나갈 위험도 같이 커요. 잘 쓴 말 한마디가 사람을 데려와요.",
      money: "재주로 버는 돈이 늘어요. 다만 계약서에 안 쓴 구두 약속은 믿지 마세요.",
      love: "표현이 과해지면 상대가 지쳐요. 재치는 좋지만 한 번은 진심만 말하세요.",
      work: "발표·제안·SNS에서 눈에 띄어요. 윗사람과의 말투만 조심하면 크게 이득이에요.",
      health: "말을 많이 해 목과 어깨가 굳어요. 목 스트레칭을 습관으로."
    },
    "편재": {
      kw: "큰돈이 도는 판에 끼는 해",
      line: "한 곳에 묶이기보다 여러 곳으로 움직일 때 돈과 기회가 보이는 해예요. 판이 크면 사람도 커져요.",
      money: "들어오는 길이 넓어지지만 새는 곳도 넓어요. ‘들어온 돈의 30%는 손대지 않기’ 규칙을 두세요.",
      love: "설렘과 바람기가 함께 오는 해예요. 진짜 남는 사람은 한 명이에요.",
      work: "영업·거래·부업처럼 사람을 만나는 일에서 성과가 나요.",
      health: "이동이 많아 피로가 쌓여요. 술자리 다음 날은 반드시 비워 두세요."
    },
    "정재": {
      kw: "차곡차곡 쌓이는 해",
      line: "크게 벌기보다 정확하게 쌓이는 해예요. 성실함이 그대로 통장과 신뢰로 남아요.",
      money: "저축·청약·적립에 유리해요. 지금 시작한 적립이 1년 뒤 가장 크게 보여요.",
      love: "진지한 관계로 가는 해예요. 약속을 지키는 모습이 가장 큰 고백이에요.",
      work: "맡은 일의 완성도가 평가로 이어져요. 눈에 안 띄어도 기록해 두세요.",
      health: "규칙적인 게 약이에요. 식사·수면 시간만 일정하게 해도 컨디션이 달라져요."
    },
    "편관": {
      kw: "압박이 성장으로 바뀌는 해",
      line: "숨이 차는 순간이 있지만, 그 압박이 실력을 끌어올리는 해예요. 버틴 사람에게 자리가 남아요.",
      money: "예상 밖 지출·세금·수선이 생길 수 있어요. 비상금을 먼저 채워 두세요.",
      love: "강한 사람에게 끌리기 쉬워요. 리드당하는 것과 존중받는 것은 달라요.",
      work: "책임이 늘고 평가도 엄격해져요. 대신 버티면 한 단계 올라가요.",
      health: "긴장이 몸에 쌓여요. 자기 전 10분 호흡만으로도 큰 차이가 나요."
    },
    "정관": {
      kw: "자리가 잡히는 해",
      line: "규칙과 자격, 소속이 나를 밀어 주는 해예요. 제도 안에서 움직이면 오히려 빨라져요.",
      money: "급여·계약·정산처럼 정해진 돈이 안정적이에요. 조건을 다시 점검하면 더 받을 수 있어요.",
      love: "관계가 공식화되기 좋은 해예요. 소개·가족 자리에서 좋은 인연이 붙을 수 있어요.",
      work: "시험·자격·승진·계약에 유리해요. 서류와 마감을 절대 놓치지 마세요.",
      health: "책임감이 몸을 굳게 해요. 일과 휴식의 경계를 시간으로 나누세요."
    },
    "편인": {
      kw: "생각이 깊어지는 해",
      line: "배우고 파고드는 데 운이 붙는 해예요. 다만 생각이 길어지면 실행이 늦어져요.",
      money: "공부·자격에 쓴 돈이 나중에 돌아와요. 충동 결제보다 ‘쓸모’로 고르세요.",
      love: "마음을 다 보여 주기 어려운 해예요. 한 번 더 표현하면 관계가 풀려요.",
      work: "기획·연구·정리처럼 혼자 몰입하는 일에서 결과가 나와요.",
      health: "생각이 많아 잠이 얕아져요. 화면 끄는 시간을 정해 두세요."
    },
    "정인": {
      kw: "도움과 배움이 들어오는 해",
      line: "나를 아는 사람과 좋은 스승이 붙는 해예요. 혼자 하지 말고 물어보면 길이 열려요.",
      money: "지원·환급·윗사람의 도움처럼 ‘들어오는 돈’이 있어요. 신청할 게 있으면 지금 하세요.",
      love: "따뜻하게 보살펴 주는 사람과 인연이 닿아요. 받는 것도 연습이 필요해요.",
      work: "추천·교육·멘토링에서 기회가 와요. 배운 걸 바로 써먹어야 남아요.",
      health: "회복이 빠른 해예요. 잘 챙겨 먹고 자면 컨디션이 눈에 띄게 올라와요."
    }
  };

  /* ── 토정비결 괘 구성 ────────────────────────────── */
  var GUA_SANG = [
    { img: "하늘", line: "판이 위에서 열리는 흐름이라, 먼저 나서기보다 크게 보고 자리를 잡는 쪽이 이겨요.", kw: "큰 흐름·주도" },
    { img: "땅", line: "아래에서 단단히 받쳐 주는 흐름이라, 눈에 안 띄어도 기반을 다지는 데 운이 붙어요.", kw: "기반·축적" },
    { img: "우레", line: "갑자기 움직이는 흐름이라, 소식과 변화가 빨라요. 반응이 빠른 사람이 가져가요.", kw: "변화·속도" },
    { img: "바람", line: "틈으로 스며드는 흐름이라, 정면보다 옆으로 들어갈 때 문이 열려요.", kw: "침투·협상" },
    { img: "물", line: "낮은 곳으로 흐르는 흐름이라, 버티기보다 흐름을 타면 멀리 가요.", kw: "유연·이동" },
    { img: "불", line: "밝히고 드러내는 흐름이라, 숨기면 오히려 손해예요. 보여 줄수록 커져요.", kw: "표현·확산" },
    { img: "산", line: "멈춰 세우는 흐름이라, 서두르면 탈이 나요. 지킬 것을 지키면 이겨요.", kw: "정지·수비" },
    { img: "못", line: "모여서 기뻐하는 흐름이라, 사람이 곧 재물이에요. 함께하는 자리에 복이 붙어요.", kw: "만남·기쁨" }
  ];
  var GUA_JUNG = [
    { stage: "씨앗", line: "아직 땅속에 있지만 방향은 이미 정해졌어요. 이때는 보이려 하지 말고 뿌리를 내리세요.", half1: "상반기는 밑작업의 시간이에요. 남들이 결과를 묻기 전에 재료를 모아 두면 하반기에 속도가 붙어요.", half2: "하반기에 심은 씨앗의 싹이 보여요. 급하게 키우지 말고 물과 햇빛(시간과 돈)을 꾸준히 대세요." },
    { stage: "새싹", line: "이제 막 얼굴을 내민 단계라, 작아도 살아 있는 게 중요해요. 첫 반응을 크게 키우세요.", half1: "상반기에 첫 반응이 와요. 크지 않아도 그 반응을 기록하고 다듬으면 여름에 판이 커져요.", half2: "하반기는 첫 수확의 시간이에요. 다만 욕심내어 가지를 치면 줄기가 약해져요." },
    { stage: "성장", line: "키가 빠르게 크는 구간이라, 관리하지 않으면 벌레가 붙어요. 사람과 일을 골라야 해요.", half1: "상반기에 사람과 일이 몰려와요. 다 받지 말고 두 개만 골라 집중하세요.", half2: "하반기에 성장의 대가로 지출과 책임이 함께 와요. 미리 여유분을 남겨 두세요." },
    { stage: "결실", line: "열매가 맺히는 흐름이라, 벌인 일이 눈에 보이는 결과로 돌아와요. 지금 거두는 법을 익히세요.", half1: "상반기에 결과가 먼저 와요. 자랑보다 정산이 중요해요. 받을 것은 확실히 받으세요.", half2: "하반기는 다음 씨앗을 고르는 시간이에요. 잘된 방식을 그대로 한 번 더 반복하세요." },
    { stage: "수확", line: "거두고 정리하는 흐름이라, 새로 벌이기보다 챙기는 게 이득이에요. 미련이 가장 큰 지출이에요.", half1: "상반기에 정리할 것이 보여요. 안 되는 일은 접고, 되는 일에 자원을 몰아주세요.", half2: "하반기에 정산과 평가가 와요. 기록해 둔 사람이 유리해요." },
    { stage: "저장", line: "안으로 모으는 흐름이라, 밖으로 키우기보다 안을 채우는 해예요. 몸과 돈을 함께 아끼세요.", half1: "상반기는 몸과 돈을 아껴야 해요. 큰 결정은 두 번 확인하세요.", half2: "하반기에 조용한 기회가 와요. 소문나지 않은 자리가 오히려 좋은 자리예요." }
  ];
  var GUA_HA = [
    { grade: "상길", line: "하괘가 상길이라, 올해는 움직이는 쪽에 복이 있어요. 망설이던 일이 있다면 상반기에 시작하세요.", short: "움직이면 이득" },
    { grade: "중길", level: 1, line: "하괘가 중길이라, 밀지도 놓지도 말고 균형을 잡는 게 답이에요. 속도보다 순서가 중요해요.", short: "균형이 답" },
    { grade: "하길", level: 2, line: "하괘가 하길이라, 올해는 지키는 것이 이기는 해예요. 새로 벌이기보다 있는 것을 단단히 하세요.", short: "지키면 남는다" }
  ];

  /* ── 월별 문안: 관계 범주 × 등급 ─────────────────── */
  var MONTH_TEXT = {
    "기회": [
      ["기회가 먼저 말을 걸어요. 미루던 연락·지원·제안을 이달에 하세요.", "사람을 통해 길이 열려요. 모임에 한 번 더 나가 보세요."],
      ["좋은 소식이 오지만 확인이 필요해요. 조건을 글로 남기세요.", "흐름은 좋아요. 다만 약속은 한 번 더 확인하세요."],
      ["작은 기회를 크게 키우지 마세요. 하나만 골라 확실히.", "문이 열려도 급하게 들어가지 마세요. 조건부터 보세요."]
    ],
    "확장": [
      ["배우고 넓히기 좋은 달이에요. 새로 시작한 공부가 오래 가요.", "사람·정보가 넓어지는 달. 인맥이 곧 자료가 돼요."],
      ["확장은 되지만 체력이 따라야 해요. 일정 사이에 빈칸을 두세요.", "조금씩 늘려 가는 게 좋아요. 한 번에 다 하지 마세요."],
      ["넓히기보다 골라야 하는 달이에요. 두 개만 남기세요.", "새로 벌이기보다 지금 가진 걸 다듬는 달이에요."]
    ],
    "무난": [
      ["무난한 달이라 루틴이 이겨요. 매일 같은 시간에 하나씩.", "특별한 일보다 쌓는 일에 좋아요. 기록을 남기세요."],
      ["잔잔한 달이에요. 큰 결정보다 점검에 쓰면 좋아요.", "평범함이 복인 달. 몸과 돈의 균형을 확인하세요."],
      ["조용히 지나가게 두세요. 굳이 판을 흔들 필요 없어요.", "서두를 이유가 없는 달. 정비에 쓰면 딱이에요."]
    ],
    "동일": [
      ["2027년 기운과 같은 달이에요. 내 색이 그대로 드러나니 밀어봐도 좋아요.", "세운과 같은 달. 내 방식이 통하는지 시험해 보기 좋아요."],
      ["세운과 겹치는 달이라 강하게 나오기 쉬워요. 반 박자만 늦춰 보세요.", "기운이 겹치는 달. 고집과 소신 사이를 살피세요."],
      ["같은 기운이 두 번 겹치는 달이라 지칠 수 있어요. 무리하지 마세요.", "나와 비슷한 달. 혼자만의 시간을 꼭 남기세요."]
    ],
    "주의": [
      ["부딪히기 쉬운 달이에요. 말과 계약을 한 번 더 확인하세요.", "속도보다 안전이에요. 서두른 결정은 미루세요."],
      ["작은 마찰이 커지기 쉬워요. 한 발 물러서면 해결돼요.", "감정적인 말은 하루 묵혔다 하세요."],
      ["지키는 달이에요. 새 일은 다음 달로 미루는 게 좋아요.", "몸과 돈을 아끼세요. 큰 지출은 이 달에 두지 마세요."]
    ]
  };
  var MONTH_SUFFIX = {
    chung: " · 일지와 부딪히는 달이라 몸조심",
    hap: " · 일지와 맞물려 관계운 상승"
  };
  var MONTH_BRANCH_LINE = [
    "밤에 답이 보이는 달", "버티는 게 이기는 달", "먼저 나가면 길이 열리는 달", "관계의 결을 다듬는 달",
    "판을 갈아엎기 좋은 달", "말과 소문이 도는 달", "무대에 서기 좋은 달", "내 색이 진해지는 달",
    "정리와 결단의 달", "완성도를 올리는 달", "의리를 확인하는 달", "크게 품는 달"
  ];

  /* ── 오행 색·숫자 ────────────────────────────────── */
  var LUCKY = [
    { color: "세이지 그린", hex: "#6FA98C", items: "초록 계열 소품, 화분, 나무 소재" },
    { color: "코랄 레드", hex: "#C9614F", items: "붉은 립, 오렌지 조명, 캔들" },
    { color: "샌드 베이지", hex: "#C0A16B", items: "베이지 니트, 도자기, 흙빛 가방" },
    { color: "실버 화이트", hex: "#9AA7B8", items: "실버 액세서리, 화이트 셔츠, 금속 소품" },
    { color: "딥 네이비", hex: "#5D7DA8", items: "네이비 코트, 블루 라이트, 유리 소품" }
  ];

  /* ── 조립 ────────────────────────────────────────── */
  function gradeLevel(res) { return res.tojeong.ha === 1 ? 0 : (res.tojeong.ha === 2 ? 1 : 2); }

  function build(res) {
    var S = global.SAJU;
    var dm = res.dayMaster, sp = STEM_PROFILE[dm.stem], bp = BRANCH_PROFILE[res.pillars.day.branch];
    var g = res.tojeong;
    var sang = GUA_SANG[g.sang - 1], jung = GUA_JUNG[g.jung - 1], ha = GUA_HA[g.ha - 1];
    var level = gradeLevel(res);
    var tg = TENGOD_PROFILE[res.seun.tenGodStem] || TENGOD_PROFILE["정관"];
    var tgB = TENGOD_PROFILE[res.seun.tenGodBranch] || tg;

    var dayNo = (res.pillars.day.stem + 1) * 10 + res.pillars.day.branch + 1;

    /* 제목 */
    var title = sp.title;
    var subtitle = S.STEM[res.pillars.day.stem] + S.BRANCH[res.pillars.day.branch] + "일주 · " + bp.kw;

    /* 총운 3문장 */
    var who = res.input.name ? res.input.name + " 님의 " : "내 ";
    var summary = [
      "2027년 정미년, " + who + "괘는 " + g.no + "괘 — " + sang.img + " 자리에 ‘" + jung.stage + "’의 결이 겹쳤어요.",
      tgB.line,
      ha.line
    ];

    /* 분야별 */
    var fields = {
      money: [tg.money, (level === 0 ? "받을 것은 확실히 받는 해예요. 청구·정산·지원금을 그냥 넘기지 마세요." : level === 1 ? "들어오는 만큼 나가기 쉬운 해예요. 큰 지출은 하루 미루는 규칙 하나면 충분해요." : "크게 벌기보다 지키는 게 이득인 해예요. 고정 지출을 한 번 정리하면 남는 게 눈에 보여요.")],
      love: [tg.love, (level === 0 ? "먼저 다가가는 쪽이 유리해요. 한 번 더 표현하면 관계가 한 칸 앞으로 가요." : level === 1 ? "밀당보다 꾸준함이 통해요. 약속을 지키는 게 가장 큰 매력이에요." : "관계는 급하게 정리하지 마세요. 시간이 편을 들어 줘요.")],
      work: [tg.work, (level === 0 ? "상반기에 문이 열려요. 지원·제안·공모를 지금 준비하세요." : level === 1 ? "맡은 일의 완성도가 다음 자리를 만들어요. 한 일은 기록으로 남기세요." : "새로 벌이기보다 실력을 다지는 해예요. 배움에 투자하면 오래 남아요.")],
      health: [tg.health, (level === 0 ? "몸을 쓸 일이 늘어나는 해예요. 잠과 식사만 지켜도 절반은 가요." : level === 1 ? "컨디션 기복이 있는 해예요. 규칙적인 식사와 수면이 약이에요." : "지치기 쉬운 해예요. 일정 사이에 회복 시간을 먼저 넣어 두세요.")]
    };

    /* 상·하반기 */
    var halves = { first: jung.half1, second: jung.half2 };

    /* 월별 */
    var months = [];
    for (var mm = 1; mm <= 12; mm++) {
      var b = null;
      /* 15일이 속한 절기 월 계산 */
      var abs15 = (S.jdn(2027, mm, 15));
      var idx = -1;
      for (var k = 11; k >= 0; k--) {
        var td = S.termDate(2027, k);
        if (abs15 >= S.jdn(td.y, td.m, td.d)) { idx = k; break; }
      }
      if (idx < 0) { var tprev = S.termDate(2026, 11); b = 0; }
      else b = (idx + 1) % 12;
      var rel = S.relation(7, b);              // 세운 미(未)와의 관계
      var cat = "무난";
      if (rel.indexOf("충") >= 0 || rel.indexOf("형") >= 0) cat = "주의";
      else if (rel.indexOf("육합") >= 0) cat = "기회";
      else if (rel.some(function (x) { return x.indexOf("삼합") === 0; })) cat = "확장";
      else if (b === 7) cat = "동일";
      var natalRel = S.relation(b, res.pillars.day.branch);
      var suf = natalRel.indexOf("충") >= 0 ? MONTH_SUFFIX.chung : (natalRel.indexOf("육합") >= 0 || natalRel.some(function (x) { return x.indexOf("삼합") === 0; }) ? MONTH_SUFFIX.hap : "");
      var variants = MONTH_TEXT[cat][level];
      var pick = (g.no + mm) % variants.length;
      months.push({
        m: mm, branch: b,
        branchName: S.BRANCH[b] + "월",
        hanja: S.BRANCH_H[b],
        cat: cat,
        relTag: rel.length ? rel.join("·") : "무관",
        text: variants[pick] + " · " + MONTH_BRANCH_LINE[b] + suf
      });
    }

    /* 행운 */
    var weak = res.weakest, over = res.strongest;
    var lucky = {
      elem: S.ELEM[weak],
      color: LUCKY[weak].color,
      hex: LUCKY[weak].hex,
      items: LUCKY[weak].items,
      number: (function () {
        var a = ((res.pillars.day.stem + g.no) % 9) + 1;
        var b = ((g.sang + g.jung + g.ha) % 9) + 1;
        if (b === a) b = (b % 9) + 1;
        return [a, b];
      })(),
      cautionMonths: months.filter(function (x) { return x.cat === "주의"; }).map(function (x) { return x.m + "월"; }),
      cautionNote: months.filter(function (x) { return x.cat === "주의"; }).length
        ? "부딪히기 쉬운 달이에요. 계약·말 한마디를 한 번 더 확인하세요."
        : "세운과 크게 부딪히는 달은 없어요. 대신 무리한 확장만 피하면 돼요.",
      goodMonths: months.filter(function (x) { return x.cat === "기회" || x.cat === "확장"; }).map(function (x) { return x.m + "월"; })
    };
    if (!lucky.cautionMonths.length) lucky.cautionMonths = ["특별히 부딪히는 달은 없어요"];

    /* 원국표 칸 */
    var cols = [];
    var order = res.hasHour ? ["hour", "day", "month", "year"] : ["day", "month", "year"];
    var labels = { year: "년주", month: "월주", day: "일주", hour: "시주" };
    order.forEach(function (k) {
      var p = res.pillars[k];
      cols.push({
        key: k, label: labels[k],
        stem: S.STEM[p.stem], stemH: S.STEM_H[p.stem], stemElem: S.STEM_ELEM[p.stem],
        branch: S.BRANCH[p.branch], branchH: S.BRANCH_H[p.branch], branchElem: S.BRANCH_ELEM[p.branch],
        stemGod: k === "day" ? "일간" : S.tenGod(res.dayMaster.elem, res.dayMaster.yang, S.STEM_ELEM[p.stem], p.stem % 2 === 0),
        branchGod: S.tenGod(res.dayMaster.elem, res.dayMaster.yang, S.BRANCH_ELEM[p.branch], false)
      });
    });

    /* 오행 문장 */
    var elemLine = [];
    var strongName = S.ELEM[over], weakName = S.ELEM[weak];
    if (res.missing.length) {
      elemLine.push((res.total / 2) + "글자에 " + res.missing.map(function (i) { return S.ELEM[i] + "(" + ELEM_NAME_H[i] + ")"; }).join(", ") + " 기운이 없어요.");
    }
    elemLine.push(strongName + "(" + ELEM_NAME_H[over] + ") 기운이 " + res.counts[over] + "개로 가장 강하고, " + weakName + "(" + ELEM_NAME_H[weak] + ") 기운이 " + res.counts[weak] + "개로 가장 약해요.");
    elemLine.push(ELEM_PROFILE[over].over);
    if (res.counts[weak] === 0) elemLine.push("그래서 올해는 " + weakName + "을 채우는 쪽으로 움직이면 좋아요. " + ELEM_PROFILE[weak].under);

    return {
      title: title, subtitle: subtitle, tag: sp.tag, body: sp.body,
      good: sp.good, bad: sp.bad, work: sp.work,
      summary: summary,
      fields: fields,
      halves: halves,
      months: months,
      lucky: lucky,
      cols: cols,
      elemLine: elemLine,
      elemProfile: ELEM_PROFILE,
      tojeong: {
        no: g.no, sang: g.sang, jung: g.jung, ha: g.ha,
        sangImg: sang.img, sangKw: sang.kw, sangLine: sang.line,
        jungStage: jung.stage, jungLine: jung.line,
        grade: ha.grade, gradeLine: ha.line, gradeShort: ha.short,
        age: g.age, taeSe: g.taeSe, wolGeon: g.wolGeon, iljin: g.iljin,
        monthLen: g.monthLen, dayUsed: g.dayUsed, clamped: g.clamped,
        monthGz: S.STEM[g.monthGz.stem] + S.BRANCH[g.monthGz.branch],
        birthdaySolar: g.solarOfBirthday ? (g.solarOfBirthday.y + "." + pad2(g.solarOfBirthday.m) + "." + pad2(g.solarOfBirthday.d)) : ""
      },
      seunInfo: {
        god: res.seun.tenGodStem, godBranch: res.seun.tenGodBranch,
        wunseong: res.seun.wunseong, kw: tg.kw,
        relations: res.seun.relations
      },
      strengthLine: res.strength === "strong" ? "기운이 넘치는 편(신강)이라 밀어붙이는 힘이 좋아요. 대신 쉬는 법을 익히면 훨씬 오래 가요."
        : res.strength === "weak" ? "받쳐 주는 기운이 필요한 편(신약)이라 혼자 다 하기보다 사람과 시스템을 쓰는 게 유리해요."
          : "기운이 고르게 잡힌 편이라 어느 쪽으로도 기울이기 쉬워요. 선택이 곧 운이 돼요.",
      dayNo: dayNo
    };
  }
  function pad2(n) { return ("0" + n).slice(-2); }

  global.SAJU_CONTENT = {
    build: build,
    STEM_PROFILE: STEM_PROFILE,
    BRANCH_PROFILE: BRANCH_PROFILE,
    ELEM_PROFILE: ELEM_PROFILE,
    ELEM_COLOR: ELEM_COLOR,
    TENGOD_PROFILE: TENGOD_PROFILE,
    LUCKY: LUCKY
  };
})(window);
