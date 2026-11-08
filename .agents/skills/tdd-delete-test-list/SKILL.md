---
name: "tdd-delete-test-list"
description: "리뷰가 끝난 PR에서 테스트 목록(docs/test-lists/PRD이름.md)을 삭제하고 커밋·푸시한다. 리뷰가 끝나고 머지하기 전에 사용."
---

# tdd-delete-test-list

마무리 단계의 절차다. 테스트 목록은 작업용 계획표라 리뷰가 끝나면 삭제한다. 내용은 이미 PR 설명에 남아 있다.

커밋 규칙은 `docs/policy/tdd.md`를 따른다.

## 시작 전 확인

- 커밋하지 않은 변경이 있으면 시작하지 않고 보고한다.
- `docs/test-lists/<PRD이름>.md`가 없으면 보고한다.

## 절차

1. `docs/test-lists/<PRD이름>.md`를 삭제한다.
2. `docs: 테스트 목록 삭제 (<PRD이름>)`로 커밋하고 푸시한다.
3. 머지할 준비가 됐다고 보고한다.

## 하지 않는 것

- 테스트 목록 외의 파일을 수정하거나 삭제하지 않는다.
- 승인, 머지를 하지 않는다.