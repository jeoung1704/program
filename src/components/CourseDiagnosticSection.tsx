import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { EVALUATION_MODE_META } from '../data/strategiesAndAlternatives';
import {
  CourseCategory,
  CourseItem,
  EvaluationMode,
  SimulationSummary,
} from '../types/academic';
import { WorkloadChart } from './WorkloadChart';

interface CourseDiagnosticSectionProps {
  courses: CourseItem[];
  simulation: SimulationSummary;
  onAddCourse: (course: Omit<CourseItem, 'id'>) => void;
  onUpdateCourseMode: (id: string, mode: EvaluationMode) => void;
  onUpdateCourseExamWeight: (id: string, weight: number) => void;
  onRemoveCourse: (id: string) => void;
  onApplyPreset: (preset: 'heavy' | 'balanced' | 'senior') => void;
  onNavigateToAlternatives: () => void;
}

const CATEGORIES: CourseCategory[] = ['전공필수', '전공선택', '교양필수', '교양선택'];
const MODES: EvaluationMode[] = [
  'exam_heavy',
  'balanced_quiz',
  'project_based',
  'pf_or_absolute',
  'deferred_season',
];

export function CourseDiagnosticSection({
  courses,
  simulation,
  onAddCourse,
  onUpdateCourseMode,
  onUpdateCourseExamWeight,
  onRemoveCourse,
  onApplyPreset,
  onNavigateToAlternatives,
}: CourseDiagnosticSectionProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CourseCategory>('전공선택');
  const [credits, setCredits] = useState<number>(3);
  const [mode, setMode] = useState<EvaluationMode>('exam_heavy');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const modeMeta = EVALUATION_MODE_META[mode];
    onAddCourse({
      name: trimmed,
      category,
      credits,
      mode,
      examWeight: modeMeta.defaultExamWeight,
      difficulty,
      hasMidterm: mode === 'exam_heavy' || mode === 'balanced_quiz',
      hasFinal: mode === 'exam_heavy' || mode === 'balanced_quiz',
    });
    setName('');
  };

  const statusColorClass =
    simulation.loadStatus === 'overload'
      ? 'text-red-700'
      : simulation.loadStatus === 'caution'
      ? 'text-amber-700'
      : 'text-emerald-700';

  return (
    <div className="space-y-8">
      {/* Intro & Scenario Presets */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            시험 집중도를 낮추는 학기 부하 설계
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            수강 과목의 평가 방식을 전환하거나 계절학기로 분산할 때 8주차(중간)·16주차(기말) 피크 부하가 어떻게 줄어드는지 즉시 시뮬레이션합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">시간표 예시 불러오기:</span>
          <button
            type="button"
            onClick={() => onApplyPreset('heavy')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
          >
            시험 집중 학기
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('balanced')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
          >
            균형 분산 학기
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('senior')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
          >
            프로젝트·대체 중심
          </button>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500">활성 수강 학점</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
              {simulation.activeCredits}학점
            </span>
            {simulation.deferredCredits > 0 && (
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                / 계절이연 {simulation.deferredCredits}학점
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            전체 등록 {courses.length}과목 ({simulation.totalCredits}학점)
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500">지필시험 집중 과목</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
              {simulation.examHeavyCount}과목
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({simulation.examHeavyRatio}%)
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            권장 상한: 학기당 2~3과목 이내
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500">시험 주간 최고 피크</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-blue-700">
              {simulation.optimizedPeakHours}h/주
            </span>
            <span className="text-xs text-emerald-700 font-semibold font-mono tabular-nums">
              -{simulation.peakReductionPercent}% 감소
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 font-mono tabular-nums">
            기존 예상 피크 {simulation.baselinePeakHours}h/주 대비
          </p>
        </div>

        <div className="bg-white p-5">
          <div className="text-xs font-medium text-slate-500">현재 부하 진단</div>
          <div className={`mt-2 flex items-center gap-1.5 text-lg font-bold ${statusColorClass}`}>
            {simulation.loadStatus === 'nominal' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            )}
            <span>{simulation.loadStatusLabel}</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500 font-mono tabular-nums">
            학기 누적 {simulation.semesterHoursSaved}시간 절감 예상
          </p>
        </div>
      </div>

      {/* Main Two-Column Workbench: Chart Stage + Quick Course Adder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
          <WorkloadChart series={simulation.weeklySeries} />

          <div className="mt-6 border-t border-slate-100 pt-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700">진단 및 조정 제안</h3>
              <button
                type="button"
                onClick={onNavigateToAlternatives}
                className="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
              >
                시험 대체 대안 8가지 보기 →
              </button>
            </div>
            <ul className="space-y-1.5">
              {simulation.diagnosisMessages.map((msg, idx) => (
                <li key={idx} className="text-sm leading-relaxed text-slate-600">
                  · {msg}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Add Course Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">과목 추가</h2>
            <p className="mt-1 text-xs text-slate-500">
              이번 학기 수강 예정 과목을 입력해 피크 변화를 확인하세요.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="course-name"
                  className="block text-xs font-medium text-slate-700"
                >
                  과목명
                </label>
                <input
                  id="course-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 선형대수학"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="course-category"
                    className="block text-xs font-medium text-slate-700"
                  >
                    이수 구분
                  </label>
                  <select
                    id="course-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CourseCategory)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="course-credits"
                    className="block text-xs font-medium text-slate-700"
                  >
                    학점
                  </label>
                  <select
                    id="course-credits"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-700 focus:outline-none"
                  >
                    {[1, 2, 3, 4].map((c) => (
                      <option key={c} value={c}>
                        {c}학점
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="course-mode"
                  className="block text-xs font-medium text-slate-700"
                >
                  평가 유형
                </label>
                <select
                  id="course-mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as EvaluationMode)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {EVALUATION_MODE_META[m].shortLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="course-diff" className="font-medium text-slate-700">
                    체감 난이도
                  </label>
                  <span className="font-mono tabular-nums font-semibold text-blue-700">
                    {difficulty} / 5
                  </span>
                </div>
                <input
                  id="course-diff"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="mt-2 w-full"
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>시간표에 과목 추가</span>
              </button>
            </form>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500 leading-relaxed">
            팁: 아래 표에서 각 과목의 평가 유형을 ‘과제·프로젝트형’이나 ‘계절학기 이연’으로 변경하면 즉시 대안 시뮬레이션이 반영됩니다.
          </div>
        </div>
      </div>

      {/* Course Roster Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              수강 과목별 평가 구조 및 대안 전환
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              각 과목의 평가 방식을 조정해 중간·기말 동시 집중도를 분산시켜 보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onApplyPreset('heavy')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>기본 과목 초기화</span>
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">등록된 수강 과목이 없습니다.</p>
            <p className="mt-1 text-xs text-slate-500">
              상단의 과목 추가 양식을 입력하거나 시간표 예시를 불러와 진단을 시작하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-6 py-3">과목명 및 구분</th>
                  <th className="px-4 py-3 text-right">학점</th>
                  <th className="px-4 py-3">평가 유형 (대안 전환)</th>
                  <th className="px-4 py-3 text-right">시험 비중</th>
                  <th className="px-4 py-3 text-right">난이도</th>
                  <th className="px-6 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => {
                  const isDeferred = course.mode === 'deferred_season';
                  return (
                    <tr
                      key={course.id}
                      className={`transition-colors hover:bg-slate-50/70 ${
                        isDeferred ? 'bg-slate-50/60 opacity-65' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-900">{course.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {course.category}
                          <span aria-hidden="true"> · </span>
                          {course.hasMidterm && course.hasFinal
                            ? '중간·기말 모두 실시'
                            : course.hasFinal
                            ? '기말 중심'
                            : '정기 필기 없음'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                        {course.credits}
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          aria-label={`${course.name} 평가 유형`}
                          value={course.mode}
                          onChange={(e) =>
                            onUpdateCourseMode(course.id, e.target.value as EvaluationMode)
                          }
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium focus:border-blue-700 focus:outline-none ${
                            course.mode === 'exam_heavy'
                              ? 'border-amber-300 bg-amber-50/50 text-amber-900'
                              : course.mode === 'deferred_season'
                              ? 'border-slate-300 bg-slate-100 text-slate-600'
                              : 'border-emerald-300 bg-emerald-50/40 text-emerald-900'
                          }`}
                        >
                          {MODES.map((m) => (
                            <option key={m} value={m}>
                              {EVALUATION_MODE_META[m].shortLabel}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            disabled={isDeferred}
                            aria-label={`${course.name} 시험 비중`}
                            value={course.examWeight}
                            onChange={(e) =>
                              onUpdateCourseExamWeight(course.id, Number(e.target.value))
                            }
                            className="w-20"
                          />
                          <span className="w-10 text-right font-mono text-xs tabular-nums text-slate-700">
                            {course.examWeight}%
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-slate-600">
                        {course.difficulty} / 5
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveCourse(course.id)}
                          aria-label={`${course.name} 삭제`}
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
