/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ActionPlanSection } from './components/ActionPlanSection';
import { AlternativesSection } from './components/AlternativesSection';
import { CourseDiagnosticSection } from './components/CourseDiagnosticSection';
import { ExportPlanModal } from './components/ExportPlanModal';
import { StrategiesSection } from './components/StrategiesSection';
import { ActiveTab, TopBar } from './components/TopBar';
import {
  CORE_STRATEGIES,
  DEFAULT_COURSES,
  EVALUATION_MODE_META,
} from './data/strategiesAndAlternatives';
import { CourseItem, EvaluationMode } from './types/academic';
import { computeSemesterSimulation } from './utils/loadSimulation';

const STORAGE_KEY = 'exam-load-studio-v1';

interface PersistedState {
  courses: CourseItem[];
  activeStrategyIds: string[];
  selectedAlternativeIds: string[];
  checkedChecklistItems: Record<string, boolean>;
}

const PRESET_SCENARIOS: Record<'heavy' | 'balanced' | 'senior', CourseItem[]> = {
  heavy: DEFAULT_COURSES,
  balanced: [
    {
      id: 'b-1',
      name: '운영체제',
      category: '전공필수',
      credits: 3,
      mode: 'exam_heavy',
      examWeight: 75,
      difficulty: 5,
      hasMidterm: true,
      hasFinal: true,
    },
    {
      id: 'b-2',
      name: '자료구조와 알고리즘',
      category: '전공필수',
      credits: 3,
      mode: 'balanced_quiz',
      examWeight: 40,
      difficulty: 4,
      hasMidterm: true,
      hasFinal: true,
    },
    {
      id: 'b-3',
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
      id: 'b-4',
      name: '글쓰기와 비판적 사고',
      category: '교양필수',
      credits: 3,
      mode: 'project_based',
      examWeight: 0,
      difficulty: 2,
      hasMidterm: false,
      hasFinal: false,
    },
    {
      id: 'b-5',
      name: '진로탐색 세미나',
      category: '교양선택',
      credits: 2,
      mode: 'pf_or_absolute',
      examWeight: 10,
      difficulty: 1,
      hasMidterm: false,
      hasFinal: false,
    },
    {
      id: 'b-6',
      name: '확률과 통계 (계절학기 분리)',
      category: '전공선택',
      credits: 3,
      mode: 'deferred_season',
      examWeight: 0,
      difficulty: 4,
      hasMidterm: false,
      hasFinal: false,
    },
  ],
  senior: [
    {
      id: 's-1',
      name: '졸업 캡스톤 디자인',
      category: '전공필수',
      credits: 3,
      mode: 'project_based',
      examWeight: 0,
      difficulty: 4,
      hasMidterm: false,
      hasFinal: false,
    },
    {
      id: 's-2',
      name: '학부연구생 개별심화연구',
      category: '전공선택',
      credits: 3,
      mode: 'project_based',
      examWeight: 0,
      difficulty: 3,
      hasMidterm: false,
      hasFinal: false,
    },
    {
      id: 's-3',
      name: 'K-MOOC 디지털 윤리',
      category: '교양선택',
      credits: 3,
      mode: 'pf_or_absolute',
      examWeight: 20,
      difficulty: 1,
      hasMidterm: false,
      hasFinal: true,
    },
    {
      id: 's-4',
      name: '소프트웨어 공학 세미나',
      category: '전공선택',
      credits: 3,
      mode: 'balanced_quiz',
      examWeight: 35,
      difficulty: 3,
      hasMidterm: false,
      hasFinal: true,
    },
    {
      id: 's-5',
      name: '공인어학 특별학점 인정',
      category: '교양필수',
      credits: 2,
      mode: 'pf_or_absolute',
      examWeight: 0,
      difficulty: 1,
      hasMidterm: false,
      hasFinal: false,
    },
  ],
};

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (Array.isArray(parsed.courses)) {
        return {
          courses: parsed.courses,
          activeStrategyIds: Array.isArray(parsed.activeStrategyIds)
            ? parsed.activeStrategyIds
            : ['st-portfolio-mix', 'st-spaced-retrieval'],
          selectedAlternativeIds: Array.isArray(parsed.selectedAlternativeIds)
            ? parsed.selectedAlternativeIds
            : ['alt-project-course', 'alt-pf-absolute'],
          checkedChecklistItems: parsed.checkedChecklistItems ?? {},
        };
      }
    }
  } catch {
    // Ignore malformed localStorage
  }
  return {
    courses: DEFAULT_COURSES,
    activeStrategyIds: ['st-portfolio-mix', 'st-spaced-retrieval'],
    selectedAlternativeIds: ['alt-project-course', 'alt-pf-absolute'],
    checkedChecklistItems: {},
  };
}

export default function App() {
  const [initial] = useState<PersistedState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('diagnostic');
  const [courses, setCourses] = useState<CourseItem[]>(initial.courses);
  const [activeStrategyIds, setActiveStrategyIds] = useState<string[]>(
    initial.activeStrategyIds
  );
  const [selectedAlternativeIds, setSelectedAlternativeIds] = useState<string[]>(
    initial.selectedAlternativeIds
  );
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<
    Record<string, boolean>
  >(initial.checkedChecklistItems);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        courses,
        activeStrategyIds,
        selectedAlternativeIds,
        checkedChecklistItems,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [courses, activeStrategyIds, selectedAlternativeIds, checkedChecklistItems]);

  const strategyReductionMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of CORE_STRATEGIES) {
      map[s.id] = s.loadReductionFactor;
    }
    return map;
  }, []);

  const simulation = useMemo(
    () =>
      computeSemesterSimulation(
        courses,
        activeStrategyIds,
        strategyReductionMap,
        selectedAlternativeIds
      ),
    [courses, activeStrategyIds, strategyReductionMap, selectedAlternativeIds]
  );

  const handleAddCourse = (newCourse: Omit<CourseItem, 'id'>) => {
    const id = `c-${Date.now()}`;
    setCourses((prev) => [...prev, { ...newCourse, id }]);
  };

  const handleUpdateCourseMode = (id: string, mode: EvaluationMode) => {
    const meta = EVALUATION_MODE_META[mode];
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              mode,
              examWeight: meta.defaultExamWeight,
              hasMidterm: mode === 'exam_heavy' || mode === 'balanced_quiz',
              hasFinal: mode === 'exam_heavy' || mode === 'balanced_quiz',
            }
          : c
      )
    );
  };

  const handleUpdateCourseExamWeight = (id: string, weight: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, examWeight: weight } : c))
    );
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleApplyPreset = (preset: 'heavy' | 'balanced' | 'senior') => {
    setCourses(PRESET_SCENARIOS[preset]);
    if (preset === 'balanced') {
      setActiveStrategyIds(['st-portfolio-mix', 'st-spaced-retrieval', 'st-credit-hedging']);
    } else if (preset === 'senior') {
      setActiveStrategyIds(['st-portfolio-mix', 'st-double-dipping']);
      setSelectedAlternativeIds(['alt-project-course', 'alt-research-study', 'alt-cert-recognition']);
    }
  };

  const handleToggleStrategy = (id: string) => {
    setActiveStrategyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAlternative = (id: string) => {
    setSelectedAlternativeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleChecklistItem = (key: string) => {
    setCheckedChecklistItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
      />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-8 md:py-10">
        {activeTab === 'diagnostic' && (
          <CourseDiagnosticSection
            courses={courses}
            simulation={simulation}
            onAddCourse={handleAddCourse}
            onUpdateCourseMode={handleUpdateCourseMode}
            onUpdateCourseExamWeight={handleUpdateCourseExamWeight}
            onRemoveCourse={handleRemoveCourse}
            onApplyPreset={handleApplyPreset}
            onNavigateToAlternatives={() => setActiveTab('alternatives')}
          />
        )}

        {activeTab === 'strategies' && (
          <StrategiesSection
            activeStrategyIds={activeStrategyIds}
            onToggleStrategy={handleToggleStrategy}
          />
        )}

        {activeTab === 'alternatives' && (
          <AlternativesSection
            selectedAlternativeIds={selectedAlternativeIds}
            onToggleAlternative={handleToggleAlternative}
            checkedChecklistItems={checkedChecklistItems}
            onToggleChecklistItem={handleToggleChecklistItem}
          />
        )}

        {activeTab === 'plan' && (
          <ActionPlanSection
            courses={courses}
            simulation={simulation}
            activeStrategyIds={activeStrategyIds}
            selectedAlternativeIds={selectedAlternativeIds}
            onToggleStrategy={handleToggleStrategy}
            onToggleAlternative={handleToggleAlternative}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-slate-500">
          <span>학기 부하 설계실 · 대학 시험 부담 최소화 전략 및 학사 대안 워크벤치</span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab('diagnostic')}
              className="hover:text-slate-900"
            >
              부하 진단기
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('strategies')}
              className="hover:text-slate-900"
            >
              6대 실행 방안
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alternatives')}
              className="hover:text-slate-900"
            >
              8대 시험 대안
            </button>
          </div>
        </div>
      </footer>

      <ExportPlanModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        courses={courses}
        simulation={simulation}
        activeStrategyIds={activeStrategyIds}
        selectedAlternativeIds={selectedAlternativeIds}
      />
    </div>
  );
}
