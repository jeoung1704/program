import { useMemo, useState } from 'react';
import {
  CORE_STRATEGIES,
  EVALUATION_MODE_META,
  EXAM_ALTERNATIVES,
} from '../data/strategiesAndAlternatives';
import { CourseItem, SimulationSummary } from '../types/academic';

interface ActionPlanSectionProps {
  courses: CourseItem[];
  simulation: SimulationSummary;
  activeStrategyIds: string[];
  selectedAlternativeIds: string[];
  onToggleStrategy: (id: string) => void;
  onToggleAlternative: (id: string) => void;
  onOpenExport: () => void;
}

export function ActionPlanSection({
  courses,
  simulation,
  activeStrategyIds,
  selectedAlternativeIds,
  onToggleStrategy,
  onToggleAlternative,
  onOpenExport,
}: ActionPlanSectionProps) {
  // Seasonal split trade-off calculator
  const [targetCredits, setTargetCredits] = useState<number>(18);
  const [seasonalCredits, setSeasonalCredits] = useState<number>(3);

  const seasonalCalc = useMemo(() => {
    const regularCredits = Math.max(9, targetCredits - seasonalCredits);
    const regularCourses = Math.ceil(regularCredits / 3);
    const baseCourses = Math.ceil(targetCredits / 3);
    const collisionBefore = Math.round((baseCourses * (baseCourses - 1)) / 2);
    const collisionAfter = Math.round((regularCourses * (regularCourses - 1)) / 2);
    const collisionDropPercent =
      collisionBefore > 0
        ? Math.round(((collisionBefore - collisionAfter) / collisionBefore) * 100)
        : 0;
    return {
      regularCredits,
      regularCourses,
      baseCourses,
      collisionBefore,
      collisionAfter,
      collisionDropPercent,
    };
  }, [targetCredits, seasonalCredits]);

  const activeStrategies = CORE_STRATEGIES.filter((s) =>
    activeStrategyIds.includes(s.id)
  );
  const selectedAlternatives = EXAM_ALTERNATIVES.filter((a) =>
    selectedAlternativeIds.includes(a.id)
  );
  const convertedCourses = courses.filter((c) => c.mode !== 'exam_heavy');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            맞춤 학기 실행 계획 및 분산 시뮬레이션
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            수강 과목별 평가 전환, 적용한 최소화 방안, 그리고 선택한 학사 대안을 한 곳에 정리해 이번 학기 실행 로드맵으로 보관합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenExport}
          className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          마크다운·JSON으로 내보내기
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Course Shifts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">과목별 평가 분산 현황</h2>
            <span className="font-mono text-xs font-semibold tabular-nums text-blue-700">
              {convertedCourses.length} / {courses.length}과목 전환
            </span>
          </div>

          {convertedCourses.length === 0 ? (
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              아직 모든 과목이 시험 집중형으로 설정되어 있습니다. 진단기에서 1~2개 과목을 프로젝트형 또는 P/F·계절이연으로 전환해 보세요.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {convertedCourses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-slate-800 truncate">{c.name}</span>
                  <span className="shrink-0 font-mono text-slate-500">
                    {EVALUATION_MODE_META[c.mode].shortLabel}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-600 font-mono tabular-nums">
            피크 감소율: <strong className="text-emerald-700">-{simulation.peakReductionPercent}%</strong> ({simulation.optimizedPeakHours}h/주)
          </div>
        </div>

        {/* 2. Selected Strategies */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">적용할 최소화 방안</h2>
            <span className="font-mono text-xs font-semibold tabular-nums text-blue-700">
              {activeStrategies.length}개 선택
            </span>
          </div>

          {activeStrategies.length === 0 ? (
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              적용 중인 실행 방안이 없습니다. ‘최소화 방안’ 탭에서 이번 학기에 실천할 항목을 선택하세요.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeStrategies.map((st) => (
                <li key={st.id} className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-medium text-slate-800">
                      {st.indexLabel}. {st.title}
                    </div>
                    <div className="mt-0.5 text-slate-500">{st.phase}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleStrategy(st.id)}
                    className="shrink-0 text-slate-400 hover:text-red-600"
                  >
                    해제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. Selected Alternatives */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">채택한 시험 대안</h2>
            <span className="font-mono text-xs font-semibold tabular-nums text-blue-700">
              {selectedAlternatives.length}개 선택
            </span>
          </div>

          {selectedAlternatives.length === 0 ? (
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              선택한 학사 대안이 없습니다. ‘시험 대안’ 탭에서 현장실습, P/F 배분, K-MOOC 등 활용 가능한 대안을 담아보세요.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedAlternatives.map((alt) => (
                <li key={alt.id} className="flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{alt.title}</div>
                    <div className="mt-0.5 text-slate-500">
                      {alt.timing} · 시험부하 -{alt.examReductionPercent}%
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleAlternative(alt.id)}
                    className="shrink-0 text-slate-400 hover:text-red-600"
                  >
                    해제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Regular vs Seasonal Semester Distribution Calculator */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                정규학기 vs 계절학기 학점 분산 손익 계산기
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                과목 수가 늘수록 시험 일정이 겹치는 조합(과목 쌍)은 제곱에 비례해 증가합니다. 3학점만 방학 계절학기로 옮겨도 시험 충돌이 급감합니다.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="target-credits" className="font-medium text-slate-700">
                  목표 총 이수학점 (정규+계절 합산)
                </label>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {targetCredits}학점
                </span>
              </div>
              <input
                id="target-credits"
                type="range"
                min={15}
                max={21}
                step={3}
                value={targetCredits}
                onChange={(e) => setTargetCredits(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-2">
                계절학기 이연 학점
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {[0, 3, 6].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setSeasonalCredits(sc)}
                    className={`rounded-md py-1.5 text-xs font-medium font-mono tabular-nums transition-colors ${
                      seasonalCredits === sc
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sc === 0 ? '이연 없음 (0학점)' : `${sc}학점 이연`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-slate-100 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs text-slate-500">정규학기 수강량</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-slate-900">
                {seasonalCalc.regularCredits}학점
              </div>
              <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                약 {seasonalCalc.regularCourses}과목 동시 응시
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs text-slate-500">시험 충돌 조합 수</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-blue-700">
                {seasonalCalc.collisionAfter}쌍
              </div>
              <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                이연 전 {seasonalCalc.collisionBefore}쌍 대비
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div className="text-xs text-slate-500">동시 충돌 감소율</div>
              <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-emerald-700">
                -{seasonalCalc.collisionDropPercent}%
              </div>
              <div className="mt-1 text-xs text-slate-500">
                과목 간 암기 간섭 완화
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
