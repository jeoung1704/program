import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { CORE_STRATEGIES } from '../data/strategiesAndAlternatives';
import { StrategyPhase } from '../types/academic';

interface StrategiesSectionProps {
  activeStrategyIds: string[];
  onToggleStrategy: (id: string) => void;
}

const PHASES: ('전체' | StrategyPhase)[] = ['전체', '수강신청 전', '학기 중', '시험 직전'];

export function StrategiesSection({
  activeStrategyIds,
  onToggleStrategy,
}: StrategiesSectionProps) {
  const [selectedPhase, setSelectedPhase] = useState<'전체' | StrategyPhase>('전체');

  // Interactive Cramming vs. Spaced Retrieval Simulator state
  const [dailyMinutes, setDailyMinutes] = useState<number>(25);
  const [examCount, setExamCount] = useState<number>(4);
  const [cadence, setCadence] = useState<'cram' | 'weekly' | 'loop137'>('loop137');

  const simResult = useMemo(() => {
    const cadenceMult = cadence === 'cram' ? 0.2 : cadence === 'weekly' ? 0.65 : 1.0;
    const totalConceptLoad = examCount * 18; // hours needed per exam period if crammed
    const preClearedHours = (dailyMinutes / 60) * 42 * cadenceMult; // 6 weeks pre-exam
    const remainingExamWeekHours = Math.max(
      examCount * 3.5,
      Math.round((totalConceptLoad - preClearedHours * 1.35) * 10) / 10
    );
    const cramBaselineHours = Math.round(totalConceptLoad * 10) / 10;
    const dailyExamWeekHours = Math.round((remainingExamWeekHours / 7) * 10) / 10;
    const cramDailyHours = Math.round((cramBaselineHours / 7) * 10) / 10;
    const sleepEstimate = Math.max(3.5, Math.min(8.0, +(8.2 - dailyExamWeekHours * 0.35).toFixed(1)));
    const retentionScore = Math.min(
      94,
      Math.round(42 + (dailyMinutes / 60) * 28 * cadenceMult + (cadence === 'loop137' ? 22 : cadence === 'weekly' ? 12 : 0))
    );

    return {
      cramBaselineHours,
      remainingExamWeekHours,
      dailyExamWeekHours,
      cramDailyHours,
      sleepEstimate,
      retentionScore,
    };
  }, [dailyMinutes, examCount, cadence]);

  const filteredStrategies =
    selectedPhase === '전체'
      ? CORE_STRATEGIES
      : CORE_STRATEGIES.filter((s) => s.phase === selectedPhase);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          시험 부하 최소화 6대 실행 방안
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          단순히 열심히 공부하는 대신 시험 주간의 피크 부하를 구조적으로 낮추는 검증된 학습·시간 배분 프로토콜입니다. 적용할 방안을 선택하면 부하 진단기 차트에 즉시 반영됩니다.
        </p>
      </div>

      {/* Interactive Spaced Retrieval vs Cramming Simulator */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                분산 인출 vs 벼락치기 부하 시뮬레이터
              </h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                평소 하루 15~30분 인출 복습이 시험 직전 주간 노동 시간과 수면을 얼마나 바꾸는지 직접 조절해 보세요.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-exams" className="font-medium text-slate-700">
                  시험 과목 수
                </label>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {examCount}과목
                </span>
              </div>
              <input
                id="sim-exams"
                type="range"
                min={1}
                max={6}
                step={1}
                value={examCount}
                onChange={(e) => setExamCount(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="sim-minutes" className="font-medium text-slate-700">
                  평시 하루 분산 복습 시간
                </label>
                <span className="font-mono font-semibold tabular-nums text-blue-700">
                  {dailyMinutes}분 / 일
                </span>
              </div>
              <input
                id="sim-minutes"
                type="range"
                min={0}
                max={60}
                step={5}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-2">
                복습 주기 방식
              </span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {[
                  { id: 'cram', label: '시험 직전 몰기' },
                  { id: 'weekly', label: '주 1회 정리' },
                  { id: 'loop137', label: '1-3-7-14 루프' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCadence(opt.id as 'cram' | 'weekly' | 'loop137')}
                    className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      cadence === opt.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 border-t border-slate-100 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs text-slate-500">시험 전주 일평균 공부</div>
                <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-blue-700">
                  {simResult.dailyExamWeekHours}h
                </div>
                <div className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                  몰아치기 시 {simResult.cramDailyHours}h/일
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs text-slate-500">시험 주간 확보 수면</div>
                <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-slate-900">
                  {simResult.sleepEstimate}h
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {simResult.sleepEstimate >= 6.5 ? '기억 공고화 적정' : '수면 부족 주의'}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs text-slate-500">장기 기억 인출률</div>
                <div className="mt-1.5 font-mono text-2xl font-bold tabular-nums text-emerald-700">
                  {simResult.retentionScore}%
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  응용 서술형 대응력
                </div>
              </div>
            </div>

            {/* Comparative Horizontal Bars */}
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-slate-600">전통적 벼락치기 (시험 1주일 총 필요 시간)</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-700">
                    {simResult.cramBaselineHours}시간
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-400 transition-all duration-200"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-700">
                    분산 인출 적용 후 (시험 1주일 잔여 시간)
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-blue-700">
                    {simResult.remainingExamWeekHours}시간
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-700 transition-all duration-200"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((simResult.remainingExamWeekHours / Math.max(1, simResult.cramBaselineHours)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar & 6 Core Strategies */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {PHASES.map((phase) => (
              <button
                key={phase}
                type="button"
                onClick={() => setSelectedPhase(phase)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedPhase === phase
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-600 font-mono tabular-nums">
            적용 중인 방안: <strong className="text-blue-700">{activeStrategyIds.length}</strong> /{' '}
            {CORE_STRATEGIES.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredStrategies.map((strategy) => {
            const isApplied = activeStrategyIds.includes(strategy.id);
            return (
              <article
                key={strategy.id}
                className={`flex flex-col justify-between rounded-xl border bg-white p-6 transition-colors ${
                  isApplied ? 'border-blue-600' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500">
                        <span>{strategy.phase}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-medium text-blue-700">
                          {strategy.reductionEstimate}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                        {strategy.indexLabel}. {strategy.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleStrategy(strategy.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        isApplied
                          ? 'bg-blue-700 text-white hover:bg-blue-800'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isApplied && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      <span>{isApplied ? '적용 중' : '내 학기에 적용'}</span>
                    </button>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {strategy.coreMechanism}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="text-xs font-semibold text-slate-800">실행 절차</div>
                    <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                      {strategy.executionSteps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-mono font-semibold text-slate-400 tabular-nums">
                            {i + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <strong className="text-slate-700">주의점:</strong> {strategy.cautionNote}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
