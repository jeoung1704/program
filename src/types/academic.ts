export type CourseCategory = '전공필수' | '전공선택' | '교양필수' | '교양선택';

export type EvaluationMode =
  | 'exam_heavy'      // 중간+기말 필기시험 비중 70% 이상
  | 'balanced_quiz'   // 수시 퀴즈·과제 분산형 (시험 40% 이하)
  | 'project_based'   // 프로젝트·레포트·발표 대체 (시험 0~10%)
  | 'pf_or_absolute'  // P/F 또는 절대평가·온라인형
  | 'deferred_season'; // 계절학기/차기학기 이연

export interface CourseItem {
  id: string;
  name: string;
  category: CourseCategory;
  credits: number;
  mode: EvaluationMode;
  examWeight: number; // 0 ~ 100 (%)
  difficulty: 1 | 2 | 3 | 4 | 5;
  hasMidterm: boolean;
  hasFinal: boolean;
}

export type StrategyPhase = '수강신청 전' | '학기 중' | '시험 직전';

export interface MinimizationStrategy {
  id: string;
  indexLabel: string;
  title: string;
  phase: StrategyPhase;
  reductionEstimate: string;
  coreMechanism: string;
  executionSteps: string[];
  cautionNote: string;
  loadReductionFactor: number; // 0.04 ~ 0.18
}

export type AlternativeTiming = '수강신청 단계' | '학기 중 전환' | '방학·장기 설계';
export type AlternativeEffect = '시험 전면 대체' | '상대평가 회피' | '시간축 분산' | '실무·스펙 겸용';

export interface ExamAlternative {
  id: string;
  title: string;
  timing: AlternativeTiming;
  effect: AlternativeEffect;
  examReductionPercent: number;
  accessibility: '높음' | '중간' | '사전준비 필요';
  summary: string;
  howItWorks: string[];
  adminChecklist: string[];
  tradeOff: string;
  recommendedFor: string;
}

export interface WeeklyLoadPoint {
  week: number;
  label: string;
  baselineHours: number;
  optimizedHours: number;
  isExamPeak: boolean;
}

export interface SimulationSummary {
  totalCredits: number;
  activeCredits: number;
  deferredCredits: number;
  examHeavyCount: number;
  examHeavyRatio: number;
  baselinePeakHours: number;
  optimizedPeakHours: number;
  peakReductionPercent: number;
  semesterHoursSaved: number;
  loadStatus: 'nominal' | 'caution' | 'overload';
  loadStatusLabel: string;
  weeklySeries: WeeklyLoadPoint[];
  diagnosisMessages: string[];
}
