interface ChecklistChipCopy {
  yes: string;
  no?: string;
}

const QUESTION_CHIP_MAP: Record<string, ChecklistChipCopy> = {
  q_vaccine_proof_required: { yes: '백신 접종 증명서 필수', no: '백신 접종증명서 필요 없음' },
  q_neutered_required: { yes: '중성화 필수', no: '중성화 필요 없음' },
  q_mixed_size_allowed: { yes: '견종/체형별 등록 가능', no: '견종/체형별 등록 불가' },
  q_manage_by_temper: { yes: '견종/체형별 분반 관리', no: '견종/체형별 분반 불가' },
  q_evaluate_temper: { yes: '강아지 성향 진단 가능', no: '강아지 성향 진단 불가' },
  q_schedule_by_temper: { yes: '일과표 조정 가능', no: '일과표 조정 불가' },
  q_max_dogs_per_day: { yes: '총 {n}마리 등원' },
  q_personalized_meal: { yes: '맞춤 배급 가능', no: '맞춤 배급 불가' },
  q_curriculum_timeblock: { yes: '정해진 커리큘럼 있음', no: '정해진 커리큘럼 없음' },
  q_nearby_vet: { yes: '근처 동물병원 있음', no: '근처 동물병원 없음' },
  q_accident_protocol: { yes: '사고 대응 규정 있음', no: '사고 대응 규정 없음' },
  q_trial_day_available: { yes: '1일 체험 가능', no: '1일 체험 불가' },
  q_refund_rules_clear: { yes: '환불 및 취소 규정 있음', no: '환불 및 취소 규정 없음' },
};

interface ChecklistChip {
  label: string;
  tone: 'yes' | 'no';
}

function getChecklistChip(questionId: string, question: string, value: string): ChecklistChip | null {
  const normalized = value.trim();
  const copy = QUESTION_CHIP_MAP[questionId];

  if (normalized === 'YES') {
    return { label: copy?.yes ?? question, tone: 'yes' };
  }

  if (normalized === 'NO') {
    return { label: copy?.no ?? question, tone: 'no' };
  }

  if (/^\d+$/.test(normalized) && Number(normalized) >= 1) {
    const template = copy?.yes ?? '총 {n}마리 등원';
    return { label: template.replace('{n}', normalized), tone: 'yes' };
  }

  return null;
}

export { getChecklistChip };
