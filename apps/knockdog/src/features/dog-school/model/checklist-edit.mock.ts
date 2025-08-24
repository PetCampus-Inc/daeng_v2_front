export interface Question {
  id: string;
  label: string;
  type: 'TRI_STATE' | 'INTEGER';
  validation?: { min: number; max: number };
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface ChecklistData {
  sections: Section[];
}

export interface QuestionAnswers {
  [questionId: string]: string | number;
}

export const vaccinationOptions = {
  YES: '예',
  UNKNOWN: '잘 모르겠어요',
  NO: '아니요',
} as const;

export const mockChecklistData: ChecklistData = {
  sections: [
    {
      id: 'sec_register',
      title: '등록요건',
      questions: [
        {
          id: 'q_vaccine_proof_required',
          label: '백신 접종증명서를 제출해야 하나요?',
          type: 'TRI_STATE',
        },
        { id: 'q_neutered_required', label: '중성화가 필요한가요?', type: 'TRI_STATE' },
        { id: 'q_mixed_size_allowed', label: '우리 아이 견종/체형이 등록 가능한가요?', type: 'TRI_STATE' },
      ],
    },
    {
      id: 'sec_temper',
      title: '강아지 성향 관리',
      questions: [
        { id: 'q_manage_by_temper', label: '견종/체형별로 분반해 관리해 주시나요?', type: 'TRI_STATE' },
        { id: 'q_evaluate_temper', label: '강아지 성향을 진단해 주시나요?', type: 'TRI_STATE' },
        { id: 'q_schedule_by_temper', label: '일과표가 강아지 성향에 따라 조정되나요?', type: 'TRI_STATE' },
        {
          id: 'q_max_dogs_per_day',
          label: '하루에 총 몇 마리까지 등록하나요?',
          type: 'INTEGER',
          validation: { min: 0, max: 500 },
        },
      ],
    },
    {
      id: 'sec_meal',
      title: '식사 및 프로그램',
      questions: [
        { id: 'q_personalized_meal', label: '사료 및 식사량 맞춤 배급이 가능한가요?', type: 'TRI_STATE' },
        { id: 'q_curriculum_timeblock', label: '하루 일과가 정해진 커리큘럼에 따라 운영하나요?', type: 'TRI_STATE' },
      ],
    },
    {
      id: 'sec_safety',
      title: '안전 관리',
      questions: [
        { id: 'q_nearby_vet', label: '근처에 동물병원이 있나요?', type: 'TRI_STATE' },
        { id: 'q_accident_protocol', label: '사고 발생 시 대응 규정이 충분히 마련되어 있나요?', type: 'TRI_STATE' },
      ],
    },
    {
      id: 'sec_policy',
      title: '이용 정책',
      questions: [
        { id: 'q_trial_day_available', label: '1일 체험 등록이 가능한가요?', type: 'TRI_STATE' },
        { id: 'q_refund_rules_clear', label: '환불 및 결제 취소 규정이 명확히 정해져 있나요?', type: 'TRI_STATE' },
      ],
    },
  ],
};
