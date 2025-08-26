import { QuestionAnswers } from '../model/checklist-edit.mock';

// @TODO : API 완성시 수정 필요
export class ChecklistEditApi {
  private static readonly STORAGE_KEY = 'checklist_answers';

  // 체크리스트 답변 로드
  static async loadAnswers(): Promise<QuestionAnswers> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
      return {};
    } catch (error) {
      console.error('체크리스트 답변 로드 실패:', error);
      return {};
    }
  }

  // 체크리스트 답변 저장
  static async saveAnswers(answers: QuestionAnswers): Promise<void> {
    try {
      // TODO: 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000)); // API 호출 시뮬레이션

      // 로컬 스토리지에 저장
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(answers));
    } catch (error) {
      console.error('체크리스트 답변 저장 실패:', error);
      throw error;
    }
  }

  // 기본 답변 생성
  static generateDefaultAnswers(): QuestionAnswers {
    return {
      q_vaccine_proof_required: 'UNKNOWN',
      q_neutered_required: 'UNKNOWN',
      q_mixed_size_allowed: 'UNKNOWN',
      q_manage_by_temper: 'UNKNOWN',
      q_evaluate_temper: 'UNKNOWN',
      q_schedule_by_temper: 'UNKNOWN',
      q_max_dogs_per_day: 0,
      q_personalized_meal: 'UNKNOWN',
      q_curriculum_timeblock: 'UNKNOWN',
      q_nearby_vet: 'UNKNOWN',
      q_accident_protocol: 'UNKNOWN',
      q_trial_day_available: 'UNKNOWN',
      q_refund_rules_clear: 'UNKNOWN',
    };
  }
}
