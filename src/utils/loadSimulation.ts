import { EVALUATION_MODE_META } from '../data/strategiesAndAlternatives';
import { CourseItem, SimulationSummary, WeeklyLoadPoint } from '../types/academic';

const WEEK_LABELS = [
  '1주',
  '2주',
  '3주',
  '4주',
  '5주',
  '6주',
  '7주',
  '8주(중간)',
  '9주',
  '10주',
  '11주',
  '12주',
  '13주',
  '14주',
  '15주',
  '16주(기말)',
];

/**
 * 16주 학기 부하 시뮬레이션 계산기
 * - 기준선(Baseline): 현재 등록 과목을 전통적인 벼락치기(시험 집중) 방식으로 수강했을 때의 주간 학습 시간
 * - 최적화(Optimized): 과목별 평가 유형 전환 + 선택된 실행 방안의 부하 분산 계수를 적용한 주간 학습 시간
 */
export function computeSemesterSimulation(
  courses: CourseItem[],
  activeStrategyIds: string[],
  strategyReductionMap: Record<string, number>,
  selectedAlternativeIds: string[]
): SimulationSummary {
  const activeCourses = courses.filter((c) => c.mode !== 'deferred_season');
  const deferredCourses = courses.filter((c) => c.mode === 'deferred_season');

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const activeCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
  const deferredCredits = deferredCourses.reduce((sum, c) => sum + c.credits, 0);

  const examHeavyCourses = activeCourses.filter((c) => c.mode === 'exam_heavy');
  const examHeavyCount = examHeavyCourses.length;
  const examHeavyRatio =
    activeCourses.length > 0 ? Math.round((examHeavyCount / activeCourses.length) * 100) : 0;

  // 적용된 전략의 총 감소 계수 (최대 48% 캡으로 현실성 유지)
  const rawStrategyFactor = activeStrategyIds.reduce(
    (acc, id) => acc + (strategyReductionMap[id] ?? 0),
    0
  );
  const strategyFactor = Math.min(0.48, rawStrategyFactor);
  // 대안 선택 보너스 (현실적 학사 구조 개선 반영, 최대 12% 추가 완화)
  const altBonus = Math.min(0.12, selectedAlternativeIds.length * 0.03);

  const weeklySeries: WeeklyLoadPoint[] = WEEK_LABELS.map((label, idx) => {
    const week = idx + 1;
    const isMidtermPrep = week === 7;
    const isMidterm = week === 8;
    const isFinalPrep = week === 15;
    const isFinal = week === 16;
    const isProjectPush = week === 13 || week === 14;
    const isExamPeak = isMidterm || isFinal;

    let baselineHours = 0;
    let optimizedHours = 0;

    for (const course of courses) {
      const basePerCredit = 1.15 + course.difficulty * 0.25;
      const weeklyBase = course.credits * basePerCredit;

      // 기준선: 모든 비이연 과목이 전형적인 시험 중심 학기였다고 가정한 기준 부하 + 실제 시험 여부 반영
      const baselineExamFactor = course.difficulty * 0.9 + (course.examWeight / 100) * 2.2;
      if (isMidterm) {
        baselineHours += weeklyBase + (course.hasMidterm ? course.credits * baselineExamFactor * 1.45 : course.credits * 0.8);
      } else if (isFinal) {
        baselineHours += weeklyBase + (course.hasFinal ? course.credits * baselineExamFactor * 1.65 : course.credits * 1.0);
      } else if (isMidtermPrep || isFinalPrep) {
        baselineHours += weeklyBase + course.credits * baselineExamFactor * 0.85;
      } else {
        baselineHours += weeklyBase * 0.85;
      }

      // 최적화 곡선: 이연된 과목 제외, 평가 유형별 피크 분산 반영
      if (course.mode === 'deferred_season') {
        continue;
      }

      const modeMeta = EVALUATION_MODE_META[course.mode];
      const examRatio = course.examWeight / 100;
      const optCourseBase = course.credits * (1.05 + course.difficulty * 0.2);

      if (course.mode === 'project_based') {
        // 프로젝트형은 시험주간 피크 대신 12~14주에 완만하게 분산
        if (isProjectPush) {
          optimizedHours += optCourseBase * 1.65;
        } else if (isMidterm || isFinal) {
          optimizedHours += optCourseBase * 0.65;
        } else {
          optimizedHours += optCourseBase * 1.05;
        }
      } else if (course.mode === 'pf_or_absolute') {
        optimizedHours += optCourseBase * (isMidterm || isFinal ? 0.9 : 0.72);
      } else if (course.mode === 'balanced_quiz') {
        if (isMidterm || isFinal) {
          optimizedHours += optCourseBase * (1.35 + examRatio * 1.1);
        } else if (isMidtermPrep || isFinalPrep) {
          optimizedHours += optCourseBase * 1.3;
        } else {
          optimizedHours += optCourseBase * 1.08;
        }
      } else {
        // exam_heavy
        const peakMult = modeMeta.peakMultiplier;
        if (isMidterm) {
          optimizedHours +=
            optCourseBase +
            (course.hasMidterm ? course.credits * baselineExamFactor * 1.35 * peakMult : optCourseBase * 0.3);
        } else if (isFinal) {
          optimizedHours +=
            optCourseBase +
            (course.hasFinal ? course.credits * baselineExamFactor * 1.55 * peakMult : optCourseBase * 0.4);
        } else if (isMidtermPrep || isFinalPrep) {
          optimizedHours += optCourseBase + course.credits * baselineExamFactor * 0.78;
        } else {
          // 분산 학습 전략이 활성화되면 평시 복습 시간이 약간 늘고 시험 주간이 줄어듦
          const spacedShift = activeStrategyIds.includes('st-spaced-retrieval') ? 1.15 : 0.88;
          optimizedHours += optCourseBase * spacedShift;
        }
      }
    }

    // 실행 방안 적용에 따른 시험 주간 부하 감축 효과 반영
    if (isMidterm || isFinal || isMidtermPrep || isFinalPrep) {
      optimizedHours = optimizedHours * (1 - strategyFactor * 0.85 - altBonus * 0.6);
    } else {
      optimizedHours = optimizedHours * (1 - strategyFactor * 0.25);
    }

    return {
      week,
      label,
      baselineHours: Math.round(baselineHours * 10) / 10,
      optimizedHours: Math.round(Math.max(0, optimizedHours) * 10) / 10,
      isExamPeak,
    };
  });

  const baselinePeakHours = Math.max(...weeklySeries.map((w) => w.baselineHours), 0);
  const optimizedPeakHours = Math.max(...weeklySeries.map((w) => w.optimizedHours), 0);

  const peakReductionPercent =
    baselinePeakHours > 0
      ? Math.max(0, Math.round(((baselinePeakHours - optimizedPeakHours) / baselinePeakHours) * 100))
      : 0;

  const totalBaseline = weeklySeries.reduce((s, w) => s + w.baselineHours, 0);
  const totalOptimized = weeklySeries.reduce((s, w) => s + w.optimizedHours, 0);
  const semesterHoursSaved = Math.max(0, Math.round(totalBaseline - totalOptimized));

  let loadStatus: SimulationSummary['loadStatus'] = 'nominal';
  let loadStatusLabel = '적정 부하';

  if (optimizedPeakHours >= 46 || examHeavyCount >= 4) {
    loadStatus = 'overload';
    loadStatusLabel = '시험 과부하 위험';
  } else if (optimizedPeakHours >= 34 || examHeavyCount >= 3) {
    loadStatus = 'caution';
    loadStatusLabel = '분산 조정 권장';
  }

  const diagnosisMessages: string[] = [];
  if (examHeavyCount >= 3) {
    diagnosisMessages.push(
      `현재 지필시험 집중 과목이 ${examHeavyCount}개(${examHeavyRatio}%)입니다. 교양 또는 전공선택 1개 이상을 과제·프로젝트형이나 P/F·절대평가로 전환하면 8·16주 피크가 크게 낮아집니다.`
    );
  }
  if (activeCredits >= 18) {
    diagnosisMessages.push(
      `수강 중인 활성 학점이 ${activeCredits}학점입니다. 시험 부하가 높은 1과목을 '계절학기 이연'으로 전환해 15학점 체제로 운영하면 잔여 과목 성적 방어가 유리해집니다.`
    );
  }
  if (!activeStrategyIds.includes('st-spaced-retrieval')) {
    diagnosisMessages.push(
      `‘15분 분산 인출 스케줄’ 방안이 아직 미적용 상태입니다. 평시 주당 1.5시간 누적 복습을 적용하면 시험 주간 벼락치기 피크를 대폭 낮출 수 있습니다.`
    );
  }
  if (diagnosisMessages.length === 0) {
    diagnosisMessages.push(
      `평가 유형 분산과 학기 중 학습 전략이 균형 있게 구성되어 있습니다. 8주차·16주차 피크 부하가 안정권(주 ${optimizedPeakHours}시간)입니다.`
    );
  }

  return {
    totalCredits,
    activeCredits,
    deferredCredits,
    examHeavyCount,
    examHeavyRatio,
    baselinePeakHours: Math.round(baselinePeakHours * 10) / 10,
    optimizedPeakHours: Math.round(optimizedPeakHours * 10) / 10,
    peakReductionPercent,
    semesterHoursSaved,
    loadStatus,
    loadStatusLabel,
    weeklySeries,
    diagnosisMessages,
  };
}
