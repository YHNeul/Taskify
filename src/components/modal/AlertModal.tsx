/**
 * AlertModal(one-button modal)
 * ----------------------------------------
 * 단순 안내/알림용 모달입니다.
 *
 * 사용 케이스:
 * - 에러 메시지 (비밀번호 불일치 등)
 * - 완료 안내 (저장 완료 등)
 *
 * 특징:
 * - 버튼 1개 (확인)
 * - 사용자 선택 없이 메시지만 전달
 *
 * props:
 * - message: 표시할 메시지
 * - buttonText: 버튼 텍스트 (기본값: "확인")
 * - onConfirm: 확인 버튼 클릭 시 실행
 *
 */

import ModalBase from '@/components/common/ModalBase';
import Button from '@/components/common/Button';

interface AlertModalProps {
  message: string;
  buttonText?: string;
  onConfirm: () => void;
}

export default function AlertModal({
  message,
  buttonText = '확인',
  onConfirm,
}: AlertModalProps) {
  return (
    <ModalBase className="w-[368px] rounded-[16px] px-[64px] py-[40px]">
      <p className="mb-[14px] text-center text-2lg-medium text-gray-700">
        {message}
      </p>

      <Button
        variant="primary"
        size="modal_lg"
        onClick={onConfirm}
        className="mx-auto w-[240px]"
      >
        {buttonText}
      </Button>
    </ModalBase>
  );
}
