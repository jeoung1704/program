import { useMemo, useState } from 'react';
import { Check, Copy, Download, X } from 'lucide-react';
import {
  CORE_STRATEGIES,
  EVALUATION_MODE_META,
  EXAM_ALTERNATIVES,
} from '../data/strategiesAndAlternatives';
import { CourseItem, SimulationSummary } from '../types/academic';

interface ExportPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItem[];
  simulation: SimulationSummary;
  activeStrategyIds: string[];
  selectedAlternativeIds: string[];
}

export function ExportPlanModal({
  isOpen,
  onClose,
  courses,
  simulation,
  activeStrategyIds,
  selectedAlternativeIds,
}: ExportPlanModalProps) {
  const [copied, setCopied] = useState(false);

  const markdownText = useMemo(() => {
    const activeStrategies = CORE_STRATEGIES.filter((s) =>
      activeStrategyIds.includes(s.id)
    );
    const selectedAlternatives = EXAM_ALTERNATIVES.filter((a) =>
      selectedAlternativeIds.includes(a.id)
    );

    const lines = [
      '# 대학 학기 시험 부하 최소화 실행 계획',
      '',
      '## 1. 학기 부하 진단 요약',
      `- 활성 수강 학점: ${simulation.activeCredits}학점 (계절학기 이연: ${simulation.deferredCredits}학점)`,
      `- 지필시험 집중 과목: ${simulation.examHeavyCount}과목 (${simulation.examHeavyRatio}%)`,
      `- 시험 주간 최고 피크: ${simulation.optimizedPeakHours}시간/주 (기존 ${simulation.baselinePeakHours}시간 대비 -${simulation.peakReductionPercent}%)`,
      `- 학기 누적 예상 절감 시간: 약 ${simulation.semesterHoursSaved}시간`,
      '',
      '## 2. 수강 과목별 평가 전략',
      ...courses.map(
        (c) =>
          `- ${c.name} (${c.category}, ${c.credits}학점): ${EVALUATION_MODE_META[c.mode].shortLabel} / 시험 비중 ${c.examWeight}%`
      ),
      '',
      '## 3. 적용할 실행 방안',
      ...(activeStrategies.length > 0
        ? activeStrategies.map((s) => `- ${s.indexLabel}. ${s.title} (${s.phase})`)
        : ['- 선택된 방안 없음']),
      '',
      '## 4. 채택한 시험 대체 학사 대안',
      ...(selectedAlternatives.length > 0
        ? selectedAlternatives.map(
            (a) => `- ${a.title} (${a.timing}, 시험 부하 -${a.examReductionPercent}%)`
          )
        : ['- 선택된 대안 없음']),
    ];
    return lines.join('\n');
  }, [courses, simulation, activeStrategyIds, selectedAlternativeIds]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard restrictions
      setCopied(false);
    }
  };

  const handleDownloadJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      simulationSummary: {
        activeCredits: simulation.activeCredits,
        deferredCredits: simulation.deferredCredits,
        baselinePeakHours: simulation.baselinePeakHours,
        optimizedPeakHours: simulation.optimizedPeakHours,
        peakReductionPercent: simulation.peakReductionPercent,
        semesterHoursSaved: simulation.semesterHoursSaved,
      },
      courses,
      activeStrategyIds,
      selectedAlternativeIds,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semester-exam-load-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="export-modal-title" className="text-base font-bold text-slate-900">
            내 학기 부하 최소화 계획서 내보내기
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            아래 마크다운 요약을 노션·에브리타임·개인 메모장에 붙여넣거나 JSON 파일로 백업할 수 있습니다.
          </p>

          <pre className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-mono">
            {markdownText}
          </pre>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>JSON 다운로드</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>클립보드에 복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span>마크다운 요약 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
