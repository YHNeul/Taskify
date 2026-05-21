/**
 * FormModal
 * ----------------------------------------
 * 입력(input)을 포함하는 모달입니다.
 *
 * 사용 케이스:
 * - 컬럼 생성
 * - 컬럼 이름 수정
 * - 이메일 초대
 *
 * 특징:
 * - 제목(title) + 라벨(label) + input + 버튼 2개
 * - 에러 메시지 표시 가능
 * - 닫기(X 버튼) 옵션 제공
 *
 * props:
 * - title: 모달 제목
 * - label: input 라벨
 * - value: input 값
 * - placeholder: input placeholder
 * - cancelText: 취소 버튼 텍스트
 * - confirmText: 확인 버튼 텍스트
 * - errorText: 에러 메시지 (있으면 표시)
 * - showCloseButton: X 버튼 표시 여부
 * - disabled: 확인 버튼 비활성화 여부
 * - onChange: input 값 변경 핸들러
 * - onCancel: 취소 버튼 클릭
 * - onConfirm: 확인 버튼 클릭
 * - onClose: X 버튼 클릭 (선택)
 *
 */

import ModalBase from '@/components/common/ModalBase';
import XIcon from '@/components/common/Icon/XIcon';
import { Input } from '@/components/common/Input';
import Button from '@/components/common/Button';

interface FormModalProps {
  title: string;
  label: string;
  value: string;
  placeholder?: string;
  cancelText?: string;
  confirmText?: string;
  errorText?: string;
  showCloseButton?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onClose?: () => void;
}

export default function FormModal({
  title,
  label,
  value,
  placeholder = '',
  cancelText = '취소',
  confirmText = '확인',
  errorText,
  children,
  showCloseButton = false,
  disabled: confirmDisabled = false,
  onChange,
  onCancel,
  onConfirm,
  onClose,
}: FormModalProps) {
  return (
    <ModalBase className="w-[568px] rounded-[8px] p-[24px]">
      <div className="mb-[24px] flex items-start justify-between">
        <h2 className="text-2xl-bold text-gray-900">{title}</h2>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:opacity-70"
          >
            <XIcon className="w-[24px] h-[24px]" />
          </button>
        )}
      </div>

      <div className="mb-[10px]">
        <label className="mb-[8px] block text-2lg-medium text-gray-700">
          {label}
        </label>

        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          isError={!!errorText}
          errorMessage={errorText}
        />
        {children && <div className="mt-[16px]">{children}</div>}
      </div>

      <div className="mt-[20px] flex gap-[14px]">
        <Button
          type="button"
          variant="secondary"
          size="modal_lg"
          onClick={onCancel}
          className="flex-1"
        >
          {cancelText}
        </Button>

        <Button
          type="button"
          variant="primary"
          size="modal_lg"
          onClick={() => {
            if (confirmDisabled) return;
            onConfirm();
          }}
          disabled={confirmDisabled}
          className="flex-1"
        >
          {confirmText}
        </Button>
      </div>
    </ModalBase>
  );
}
