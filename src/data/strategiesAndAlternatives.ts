import { CourseItem, EvaluationMode, ExamAlternative, MinimizationStrategy } from '../types/academic';

export const EVALUATION_MODE_META: Record<
  EvaluationMode,
  { label: string; shortLabel: string; defaultExamWeight: number; peakMultiplier: number }
> = {
  exam_heavy: {
    label: '시험 집중형 (중간+기말 70%+)',
    shortLabel: '시험 집중형',
    defaultExamWeight: 80,
    peakMultiplier: 1.0,
  },
  balanced_quiz: {
    label: '퀴즈·과제 분산형 (시험 40% 이하)',
    shortLabel: '분산 평가형',
    defaultExamWeight: 35,
    peakMultiplier: 0.48,
  },
  project_based: {
    label: '프로젝트·산출물 대체 (시험 없음)',
    shortLabel: '과제·프로젝트형',
    defaultExamWeight: 0,
    peakMultiplier: 0.28,
  },
  pf_or_absolute: {
    label: 'P/F·절대평가·온라인형',
    shortLabel: 'P/F·절대평가',
    defaultExamWeight: 20,
    peakMultiplier: 0.25,
  },
  deferred_season: {
    label: '계절학기 이연 (이번 학기 제외)',
    shortLabel: '계절학기 이연',
    defaultExamWeight: 0,
    peakMultiplier: 0,
  },
};

export const DEFAULT_COURSES: CourseItem[] = [
  {
    id: 'c-1',
    name: '운영체제',
    category: '전공필수',
    credits: 3,
    mode: 'exam_heavy',
    examWeight: 80,
    difficulty: 5,
    hasMidterm: true,
    hasFinal: true,
  },
  {
    id: 'c-2',
    name: '자료구조와 알고리즘',
    category: '전공필수',
    credits: 3,
    mode: 'exam_heavy',
    examWeight: 70,
    difficulty: 4,
    hasMidterm: true,
    hasFinal: true,
  },
  {
    id: 'c-3',
    name: '확률과 통계',
    category: '전공선택',
    credits: 3,
    mode: 'exam_heavy',
    examWeight: 85,
    difficulty: 4,
    hasMidterm: true,
    hasFinal: true,
  },
  {
    id: 'c-4',
    name: '현대사회와 윤리',
    category: '교양필수',
    credits: 3,
    mode: 'exam_heavy',
    examWeight: 70,
    difficulty: 2,
    hasMidterm: true,
    hasFinal: true,
  },
  {
    id: 'c-5',
    name: '데이터 시각화 프로젝트',
    category: '전공선택',
    credits: 3,
    mode: 'project_based',
    examWeight: 0,
    difficulty: 3,
    hasMidterm: false,
    hasFinal: false,
  },
  {
    id: 'c-6',
    name: '진로탐색 세미나',
    category: '교양선택',
    credits: 2,
    mode: 'pf_or_absolute',
    examWeight: 10,
    difficulty: 1,
    hasMidterm: false,
    hasFinal: false,
  },
];

export const CORE_STRATEGIES: MinimizationStrategy[] = [
  {
    id: 'st-portfolio-mix',
    indexLabel: '01',
    title: '평가 유형 4:3:3 포트폴리오 배합',
    phase: '수강신청 전',
    reductionEstimate: '시험 피크 부하 약 32% 감소',
    coreMechanism:
      '한 학기 모든 과목이 중간·기말 지필고사로 몰리는 구조가 과부하의 주원인입니다. 강의계획서(Syllabus)의 평가 비율을 기준으로 지필시험형 40%, 과제·발표형 30%, P/F·절대평가형 30%로 포트폴리오를 강제 배분합니다.',
    executionSteps: [
      '수강신청 전 강의계획서에서 중간고사+기말고사 합산 비중이 60%를 넘는 과목을 표시합니다.',
      '전공 필수 시험 과목이 3개를 초과하면 교양은 반드시 과제·토론·절대평가 과목으로 대체합니다.',
      '기말고사 기간과 팀프로젝트 마감 주가 겹치는 과목 조합을 사전에 피합니다.',
    ],
    cautionNote: '과제 대체 과목은 12~14주차에 부하가 이동하므로 시험 주간과 1~2주 시차가 나는지 확인해야 합니다.',
    loadReductionFactor: 0.14,
  },
  {
    id: 'st-spaced-retrieval',
    indexLabel: '02',
    title: '15분 분산 인출 스케줄 (1-3-7-14 루프)',
    phase: '학기 중',
    reductionEstimate: '시험 주간 순공부 시간 45% 절감',
    coreMechanism:
      '수업 직후 10분 이내 핵심 개념 3가지를 백지에 적고, 3일·7일·14일 주기로 짧게 인출하면 8주차·16주차에 처음부터 다시 암기하는 인지 비용이 사라집니다.',
    executionSteps: [
      '강의 종료 직후 노트를 덮고 오늘 배운 핵심 질문 3개와 키워드만 메모합니다.',
      '매주 금요일 오후 40분을 "주간 누적 인출 블록"으로 고정해 지난 2주 분량의 문제만 풉니다.',
      '재독(다시 읽기) 대신 연습문제·기출 변형 풀이로 인출 성공률만 체크합니다.',
    ],
    cautionNote: '완벽하게 필기를 정리하려는 강박을 버리고, 키워드 질문 리스트만 빠르게 유지하는 것이 핵심입니다.',
    loadReductionFactor: 0.16,
  },
  {
    id: 'st-pareto-rubric',
    indexLabel: '03',
    title: '루브릭·기출 기반 80/20 범위 압축',
    phase: '시험 직전',
    reductionEstimate: '불필요한 학습 범위 35% 축소',
    coreMechanism:
      '교재 모든 페이지를 균등하게 학습하는 것은 최악의 시간 효율을 냅니다. 교수의 강의 강조 신호, 이전 기출 출제 패턴(암기형 vs 응용서술형), 채점 루브릭을 기준으로 출제 확률 상위 20% 핵심 개념에 에너지를 집중합니다.',
    executionSteps: [
      '강의 녹화·슬라이드에서 교수가 "중요하다", "비교할 수 있어야 한다"고 언급한 개념만 별도 목록화합니다.',
      '객관식 과목은 개념 간 차이표로, 서술형 과목은 A4 1장 분량의 논리 구조도(인과관계)로 압축합니다.',
      '출제 빈도가 낮은 지엽적 각주는 과감히 후순위(잔여 시간용)로 분리합니다.',
    ],
    cautionNote: '전공 심화 과목에서 개념 간 연결고리가 빠지면 응용문제에 취약해질 수 있으므로 기본 원리 뼈대는 유지합니다.',
    loadReductionFactor: 0.1,
  },
  {
    id: 'st-double-dipping',
    indexLabel: '04',
    title: '과제-시험-포트폴리오 이중 활용 (Double-Dipping)',
    phase: '학기 중',
    reductionEstimate: '과목당 준비 시간 25% 절약',
    coreMechanism:
      '서로 다른 두 과목의 에세이·텀프로젝트 주제나 교내 공모전·대외활동 산출물을 하나의 공통 주제 축으로 정렬하여, 한 번의 리서치와 구현으로 복수의 평가를 동시에 충족합니다.',
    executionSteps: [
      '학기 초 모든 과목의 프로젝트·레포트 주제를 나열하고 교집합(데이터셋, 도메인, 방법론)을 찾습니다.',
      '전공 프로젝트의 배경 조사 문헌을 교양 글쓰기 과목의 분석 주제로 연계합니다(자기표절 규정은 준수).',
      '팀프로젝트에서는 발표·문서화보다 자신이 강한 모듈을 맡아 재사용 가능한 자산으로 남깁니다.',
    ],
    cautionNote: '동일 원고를 그대로 제출하는 것은 자기표절에 해당하므로 반드시 관점·분석 대상을 달리해 각 과목 기준에 맞게 새로 작성해야 합니다.',
    loadReductionFactor: 0.08,
  },
  {
    id: 'st-credit-hedging',
    indexLabel: '05',
    title: '수강철회(W)·학점포기·계절학기 리스크 헤징',
    phase: '학기 중',
    reductionEstimate: '과부하 시 잔여 과목 평점 방어',
    coreMechanism:
      '시험 5개 이상이 겹쳐 모든 과목이 동반 하락할 위기라면, 한계 효율이 가장 낮은 1과목을 학기 중 수강철회(W)하거나 계절학기로 이연해 나머지 과목의 집중도와 평점을 방어하는 손절 전략입니다.',
    executionSteps: [
      '중간고사 2주 전 각 과목의 예상 투입 시간 대비 학점 기여도를 점검합니다.',
      '수강철회 마감일 이전에 교내 학칙(재수강 상한, 장학금 최소 이수학점 기준)을 확인합니다.',
      '이연한 3학점은 방학 중 계절학기 3주 단기 집중으로 1과목만 단독 처리해 부하를 분산합니다.',
    ],
    cautionNote: '국가장학금 및 교내 성적장학금의 직전 학기 최소 이수학점(보통 12학점 이상)과 F/W 제한 규정을 반드시 먼저 확인하세요.',
    loadReductionFactor: 0.12,
  },
  {
    id: 'st-cognitive-protocol',
    indexLabel: '06',
    title: '시험 72시간 전 인지 에너지·수면 프로토콜',
    phase: '시험 직전',
    reductionEstimate: '실수율 감소 및 체감 피로 30% 완화',
    coreMechanism:
      '밤샘(Sleep Deprivation)은 해마의 기억 공고화를 차단해 다음 날 시험 실수를 급증시킵니다. 최소 수면 시간(6.5시간)을 고정하고, 시험 기간 중 사소한 의사결정(식사, 복장, 공부 장소)을 자동화하여 인지 자원을 시험에만 배정합니다.',
    executionSteps: [
      '시험 3일 전부터 기상·취침 시각과 식사 메뉴·학습 좌석을 완전히 고정합니다.',
      '90분 집중 + 20분 비화면 휴식(산책·눈 감기) 사이클로 작업기억 포화를 방지합니다.',
      '전날 새벽 1시 이후 신규 암기는 중단하고 이미 정리한 요약본 1회전 후 취침합니다.',
    ],
    cautionNote: '카페인 과다 섭취는 당일 밤 얕은 수면을 유발해 다음 날 오전에 급격한 인지 저하를 만듭니다.',
    loadReductionFactor: 0.07,
  },
];

export const EXAM_ALTERNATIVES: ExamAlternative[] = [
  {
    id: 'alt-project-course',
    title: '프로젝트·캡스톤·세미나 기반 교과목 대체',
    timing: '수강신청 단계',
    effect: '시험 전면 대체',
    examReductionPercent: 95,
    accessibility: '높음',
    summary:
      '중간·기말 필기시험 대신 텀프로젝트, 코드 구현, 프로토타입, 또는 에세이 발표로 성적을 산출하는 과목을 전공선택·교양에 편입합니다.',
    howItWorks: [
      '수강편람에서 "캡스톤디자인", "프로젝트", "세미나", "스튜디오", "실습" 키워드가 포함된 강좌를 탐색합니다.',
      '전공선택 학점 중 이론 지필시험 과목 1~2개를 프로젝트형 과목으로 치환합니다.',
      '8주차·16주차 시험 벼락치기 대신 매주 2~3시간씩 산출물을 누적하여 시험 주간 스트레스를 0에 가깝게 낮춥니다.',
    ],
    adminChecklist: [
      '졸업 요건상 필수 이수해야 하는 이론 전공필수 여부를 확인했는가?',
      '팀프로젝트 비중과 무임승차 방지(동료평가) 기준이 강의계획서에 명시되어 있는가?',
      '프로젝트 최종 발표 주간이 타 과목 기말고사 주간과 겹치지 않는가?',
    ],
    tradeOff: '시험 압박은 사라지지만 학기 중 매주 일정한 협업·제작 시간 투자가 필요하며 팀원 변수 관리가 중요합니다.',
    recommendedFor: '암기형 필기시험에 약하거나 포트폴리오/산출물을 동시에 남기고 싶은 학생',
  },
  {
    id: 'alt-pf-absolute',
    title: 'P/F(Pass/Fail) 및 절대평가 과목 전략적 배분',
    timing: '수강신청 단계',
    effect: '상대평가 회피',
    examReductionPercent: 70,
    accessibility: '높음',
    summary:
      '상대평가(A+ 비율 제한)에서 발생하는 과도한 0.1점 경쟁 피로를 줄이기 위해 P/F 과목, 영어강의(절대평가), 교양 소규모 세미나를 의도적으로 섞습니다.',
    howItWorks: [
      '졸업 이수 가능 범위 내에서 P/F 과목(진로, 사회봉사, 채플, 특강 등)을 매 학기 2~3학점 확보합니다.',
      '교내 학칙상 외국인 수강생 비율이나 소규모 인원(예: 20명 이하)으로 절대평가가 적용되는 과목을 찾습니다.',
      '절대평가 과목에서는 "상위 10% 경쟁" 대신 "기준점(예: 90점) 도달"에만 필요한 최소 에너지만 투입합니다.',
    ],
    adminChecklist: [
      '우리 대학 학칙에서 졸업까지 인정되는 P/F 최대 학점 상한을 확인했는가?',
      '장학금 산정 시 P/F 과목 제외 후 평점 계산 방식에 불이익이 없는가?',
      '절대평가 전환 조건(수강 인원, 원어강의 기준 등)이 변동되지 않았는가?',
    ],
    tradeOff: 'P/F 과목은 평점(GPA)을 끌어올리는 데 기여하지 못하므로 고학점 상승이 목표일 때는 비중 조절이 필요합니다.',
    recommendedFor: '상대평가 줄세우기 시험 스트레스를 줄이고 전공 핵심 과목에 집중하고 싶은 학생',
  },
  {
    id: 'alt-kmooc-exchange',
    title: 'K-MOOC · 온라인 공개강좌 · 타 대학 학점교류',
    timing: '수강신청 단계',
    effect: '시간축 분산',
    examReductionPercent: 60,
    accessibility: '높음',
    summary:
      '정규 오프라인 시험 대신 온라인 퀴즈·상호평가·오픈북 과제로 평가하는 K-MOOC, 대학 연합 온라인 강좌(OCW/KCU 등), 또는 방학 학점교류를 활용합니다.',
    howItWorks: [
      '교내 학사공지에서 매 학기 인정되는 K-MOOC/KCU/타 대학 연합 온라인 교양 목록을 확인합니다.',
      '대부분 주간 짧은 퀴즈와 온라인 과제 또는 비대면 오픈북 시험으로 진행되어 암기 부하가 낮습니다.',
      '통학·공강 시간에 배속 수강이 가능해 전체 학습 밀도를 크게 낮춥니다.',
    ],
    adminChecklist: [
      '이수구분(교양선택/일반선택/자유선택) 및 학기당 온라인 학점 인정 상한(보통 3~6학점)을 확인했는가?',
      '이수증 제출 마감일과 별도 학점인정 신청 절차를 놓치지 않았는가?',
      '수수료 또는 별도 플랫폼 시험 응시 일정이 있는지 확인했는가?',
    ],
    tradeOff: '주간 출석 인정 마감을 놓치면 자동 감점되므로 캘린더 알림 설정이 필수입니다.',
    recommendedFor: '교양 학점을 최소 시간과 낮은 시험 부담으로 채우고 싶은 통학생·고학년',
  },
  {
    id: 'alt-ipp-internship',
    title: '현장실습(IPP) · 장기 인턴십 · 창업학점 전환',
    timing: '방학·장기 설계',
    effect: '실무·스펙 겸용',
    examReductionPercent: 100,
    accessibility: '사전준비 필요',
    summary:
      '3~4학년 전공 학점을 지필시험 없이 기업 현장실습(단기 4주/장기 4~6개월)이나 창업실습 학점으로 대체하여 실무 경력과 학점을 동시에 취득합니다.',
    howItWorks: [
      '대학 현장실습지원센터(IPP/표준현장실습)를 통해 방학 3~6학점 또는 학기제 12~15학점을 신청합니다.',
      '평가는 중간·기말 시험 대신 주간 업무일지, 기업 멘토 평가, 최종 결과 보고서(P/F 또는 절대평가)로 진행됩니다.',
      '한 학기 분량의 시험 5~6개를 통째로 건너뛰면서 취업 포트폴리오와 실습비(급여)까지 확보할 수 있습니다.',
    ],
    adminChecklist: [
      '전공학점으로 인정되는지, 일반선택으로만 인정되는지 학과 사무실에 확인했는가?',
      '복수전공·부전공 필수 과목과 겹쳐 졸업이 지연되지 않는가?',
      '현장실습 연계 기업 지원 마감(보통 직전 학기 말) 일정을 확인했는가?',
    ],
    tradeOff: '풀타임 근무에 따른 직무 몰입이 필요하며, 전공 필수 이론 과목 이수 시기를 앞당겨 놓아야 합니다.',
    recommendedFor: '시험보다 실무 경험과 취업 준비를 우선해야 하는 3~4학년',
  },
  {
    id: 'alt-cert-recognition',
    title: '어학·자격증·공모전 수상 학점 인정 제도',
    timing: '방학·장기 설계',
    effect: '실무·스펙 겸용',
    examReductionPercent: 85,
    accessibility: '중간',
    summary:
      '토익·오픽·HSK 등 공인어학성적이나 전공 관련 국가기술자격증(정보처리기사, 컴활, SQLD 등), 공인 공모전 입상을 교양·전공 학점 또는 졸업시험 대체로 인정받습니다.',
    howItWorks: [
      '학교 포털의 "자격증/어학 학점인정" 또는 "특별학점" 규정을 조회합니다.',
      '방학 중 취득한 어학 성적이나 자격증으로 1~3학점의 기초 교양·졸업인증 과목을 면제받습니다.',
      '취업 스펙으로 어차피 따야 하는 자격을 학점으로 이중 환산하므로 학기 중 시험 과목 1개를 줄이는 효과가 있습니다.',
    ],
    adminChecklist: [
      '입학 후 취득한 성적만 인정되는지(재학 중 취득 제한) 확인했는가?',
      'P/F로 인정되는지, 특정 등급(예: A0)으로 환산되는지 규정을 확인했는가?',
      '학점 인정 신청 기간(보통 개강 첫 달 또는 종강 전)을 확인했는가?',
    ],
    tradeOff: '대부분의 대학에서 인정 학점 상한(예: 재학 중 총 3~6학점)을 두고 있습니다.',
    recommendedFor: '이미 어학 성적·자격증을 보유했거나 방학 중 취득 계획이 있는 학생',
  },
  {
    id: 'alt-seasonal-split',
    title: '계절학기 분산 전략 (정규 15학점 + 계절 3학점)',
    timing: '방학·장기 설계',
    effect: '시간축 분산',
    examReductionPercent: 45,
    accessibility: '높음',
    summary:
      '정규학기에 18~21학점을 무리하게 몰아넣는 대신 15학점 이하로 낮추고, 부담이 큰 전공·교양 1과목을 여름·겨울 계절학기 3주 동안 단독으로 처리합니다.',
    howItWorks: [
      '정규학기 6과목(18학점)을 5과목(15학점)으로 줄이면 중간·기말 동시 충돌 확률이 기하급수적으로 감소합니다.',
      '계절학기에는 단 1과목만 수강하므로 타 과목 시험과 겹치지 않고 집중력이 온전히 한 곳에 모입니다.',
      '정규학기의 성적 방어와 방학 중 3주 단기 집중이라는 효율적 시간 분산이 가능합니다.',
    ],
    adminChecklist: [
      '해당 필수 과목이 계절학기에 실제로 개설되는지(과거 2년 개설 이력) 확인했는가?',
      '계절학기 추가 등록금(학점당 비용) 예산이 허용되는가?',
      '직전 학기 최소 이수학점(장학금 기준)을 충족하는가?',
    ],
    tradeOff: '계절학기 수강료가 별도로 발생하며 방학 중 3~4주간 등교 또는 온라인 출석이 필요합니다.',
    recommendedFor: '시험 주간 과목 충돌 때문에 평점 손실을 반복하는 학생',
  },
  {
    id: 'alt-research-study',
    title: '학부연구생(URP)·독립심화학습(Individual Study)',
    timing: '학기 중 전환',
    effect: '시험 전면 대체',
    examReductionPercent: 90,
    accessibility: '사전준비 필요',
    summary:
      '교수님 연구실 인턴(학부연구생)이나 학과별 개별연구 교과목을 신청해 필기시험 대신 문헌 리뷰, 실험 보조, 최종 연구 보고서로 전공 학점을 이수합니다.',
    howItWorks: [
      '관심 분야 교수님께 학부연구생 또는 개별연구(Independent Study) 교과목 개설/수강 가능 여부를 메일로 문의합니다.',
      '정형화된 암기 시험 대신 랩 미팅 참여와 소규모 탐구 결과 발표로 성적이 부여됩니다.',
      '대학원 진학이나 연구 직군을 고려한다면 추천서와 연구 경험까지 동시에 확보됩니다.',
    ],
    adminChecklist: [
      '학과 내 "개별연구/연구학점/URP" 교과목 코드가 존재하는지 확인했는가?',
      '지도교수 사전 승인서 제출 마감일(보통 수강신청 2주 전)을 확인했는가?',
    ],
    tradeOff: '정해진 시험 범위가 없는 만큼 스스로 연구 문제를 정의하고 교수님과 꾸준히 소통해야 합니다.',
    recommendedFor: '시험 암기보다 깊이 있는 탐구·실험·연구에 흥미가 있는 학생',
  },
  {
    id: 'alt-openbook-takehome',
    title: '오픈북·테이크홈(Take-Home) 에세이형 과목 우선 선택',
    timing: '수강신청 단계',
    effect: '상대평가 회피',
    examReductionPercent: 55,
    accessibility: '높음',
    summary:
      '단순 암기량을 측정하는 폐쇄형 시험 대신 자료 검색이 허용되는 오픈북 시험이나 48시간~1주간 주어지는 테이크홈(Take-Home) 과제형 시험 과목을 우선 선택합니다.',
    howItWorks: [
      '선배 강의평과 강의계획서에서 "오픈북", "오픈노트", "Take-home exam", "기말 에세이 대체" 여부를 확인합니다.',
      '암기 시간 대신 핵심 개념 색인표(Cheat Sheet / 인덱스 노트)만 미리 만들어 두면 시험 당일 긴장도가 급감합니다.',
      '여러 과목이 같은 날 시험이어도 암기 간섭 현상(전 과목 내용이 뒤섞이는 현상)이 발생하지 않습니다.',
    ],
    adminChecklist: [
      '오픈북 허용 범위(교재만 가능 / 전자기기 가능 / A4 1장 요약본만 가능)를 정확히 확인했는가?',
      '테이크홈 시험의 경우 분량 제한 및 AI/표절 검사 기준을 숙지했는가?',
    ],
    tradeOff: '오픈북 시험은 단순 정의보다 응용·비판적 사고 문제를 출제하므로 개념 위치 색인을 미리 정리해야 합니다.',
    recommendedFor: '단순 암기 압박과 여러 과목 동시 암기 간섭을 피하고 싶은 모든 대학생',
  },
];
