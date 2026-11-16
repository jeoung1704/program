import { useState } from 'react';
import { Check, CheckSquare, Square } from 'lucide-react';
import { EXAM_ALTERNATIVES } from '../data/strategiesAndAlternatives';
import { AlternativeEffect, AlternativeTiming } from '../types/academic';

interface AlternativesSectionProps {
  selectedAlternativeIds: string[];
  onToggleAlternative: (id: string) => void;
  checkedChecklistItems: Record<string, boolean>;
  onToggleChecklistItem: (key: string) => void;
}

const TIMINGS: ('전체' | AlternativeTiming)[] = [
  '전체',
  '수강신청 단계',
  '학기 중 전환',
  '방학·장기 설계',
];

const EFFECTS: ('전체' | AlternativeEffect)[] = [
  '전체',
  '시험 전면 대체',
  '상대평가 회피',
  '시간축 분산',
  '실무·스펙 겸용',
];

export function AlternativesSection({
  selectedAlternativeIds,
  onToggleAlternative,
  checkedChecklistItems,
  onToggleChecklistItem,
}: AlternativesSectionProps) {
  const [timingFilter, setTimingFilter] = useState<'전체' | AlternativeTiming>('전체');
  const [effectFilter, setEffectFilter] = useState<'전체' | AlternativeEffect>('전체');
  const [focusedId, setFocusedId] = useState<string>(EXAM_ALTERNATIVES[0].id);

  const filtered = EXAM_ALTERNATIVES.filter((item) => {
    const matchTiming = timingFilter === '전체' || item.timing === timingFilter;
    const matchEffect = effectFilter === '전체' || item.effect === effectFilter;
    return matchTiming && matchEffect;
  });

  const focusedItem =
    filtered.find((item) => item.id === focusedId) ?? filtered[0] ?? EXAM_ALTERNATIVES[0];

  const isSelected = selectedAlternativeIds.includes(focusedItem.id);

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          시험을 대체·우회하는 8가지 학사 대안
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          필기시험 위주의 평가 구조 자체를 피하거나 분산시킬 수 있는 실질적인 대학 학사제도 및 교과목 선택 대안입니다. 왼쪽에서 대안을 고르고 오른쪽에서 학사 규정 체크리스트를 확인하세요.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {TIMINGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimingFilter(t)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  timingFilter === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {EFFECTS.map((ef) => (
              <button
                key={ef}
                type="button"
                onClick={() => setEffectFilter(ef)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  effectFilter === ef
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {ef}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-600 font-mono tabular-nums">
          계획에 담은 대안: <strong className="text-blue-700">{selectedAlternativeIds.length}</strong>개
        </div>
      </div>

      {/* Two-Column Master-Detail Matrix */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            선택한 조건에 일치하는 대안이 없습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              setTimingFilter('전체');
              setEffectFilter('전체');
            }}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Master List */}
          <div className="lg:col-span-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {filtered.map((alt, idx) => {
              const isFocused = focusedItem.id === alt.id;
              const isPicked = selectedAlternativeIds.includes(alt.id);
              return (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => setFocusedId(alt.id)}
                  className={`w-full text-left px-5 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-blue-700 ${
                    isFocused ? 'bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        <span>{alt.timing}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{alt.effect}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums font-medium text-blue-700">
                          시험부하 -{alt.examReductionPercent}%
                        </span>
                      </div>
                      <h2
                        className={`mt-1 text-sm font-semibold leading-snug ${
                          isFocused ? 'text-blue-900' : 'text-slate-900'
                        }`}
                      >
                        0{idx + 1}. {alt.title}
                      </h2>
                    </div>

                    {isPicked && (
                      <span className="shrink-0 text-xs font-semibold text-emerald-700">
                        선택됨
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Panel */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="max-w-xl">
                <div className="text-xs text-slate-500">
                  <span>{focusedItem.timing}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{focusedItem.effect}</span>
                  <span aria-hidden="true"> · </span>
                  <span>실행 접근성: {focusedItem.accessibility}</span>
                </div>
                <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                  {focusedItem.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onToggleAlternative(focusedItem.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                <span>{isSelected ? '내 계획에 담김' : '내 실행 계획에 담기'}</span>
              </button>
            </div>

            <p className="text-sm leading-relaxed text-slate-700">{focusedItem.summary}</p>

            {/* Key Quantitative Strip */}
            <div className="grid grid-cols-1 gap-4 border-y border-slate-100 py-4 sm:grid-cols-2">
              <div>
                <div className="text-xs text-slate-500">예상 지필시험 대체·감소율</div>
                <div className="mt-1 font-mono text-2xl font-bold tabular-nums text-blue-700">
                  {focusedItem.examReductionPercent}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">추천 대상</div>
                <div className="mt-1 text-sm font-medium text-slate-800">
                  {focusedItem.recommendedFor}
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900">구체적 실행 방법</h3>
              <ol className="mt-2.5 space-y-2 text-sm leading-relaxed text-slate-600">
                {focusedItem.howItWorks.map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums pt-0.5">
                      0{i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Admin Rules Interactive Checklist */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <h3 className="text-xs font-semibold text-slate-800">
                우리 대학 학칙·학사제도 사전 확인 체크리스트
              </h3>
              <div className="mt-3 space-y-2">
                {focusedItem.adminChecklist.map((checkItem, idx) => {
                  const key = `${focusedItem.id}-${idx}`;
                  const checked = Boolean(checkedChecklistItems[key]);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onToggleChecklistItem(key)}
                      className="flex w-full items-start gap-2.5 text-left text-xs leading-relaxed text-slate-700 hover:text-slate-900"
                    >
                      {checked ? (
                        <CheckSquare
                          className="h-4 w-4 shrink-0 text-blue-700 mt-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <Square
                          className="h-4 w-4 shrink-0 text-slate-400 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                      <span className={checked ? 'line-through text-slate-400' : ''}>
                        {checkItem}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trade-off */}
            <div className="text-xs leading-relaxed text-slate-600">
              <strong className="text-slate-800">고려할 트레이드오프:</strong> {focusedItem.tradeOff}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
