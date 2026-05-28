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

import ModalBase from '@/shared/components/common/ModalBase';
import XIcon from '@/shared/components/common/Icon/XIcon';
import { Input } from '@/shared/components/common/Input';
import Button from '@/shared/components/common/Button';

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
    <ModalBase className="w-modal-form rounded-lg p-6">
      <div className="mb-6 flex items-start justify-between">
        <h2 className="text-2xl-bold text-gray-900">{title}</h2>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="interactive-icon-btn p-2 cursor-pointer"
          >
            <XIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="mb-2.5">
        <label className="mb-2 block text-2lg-medium text-gray-700">
          {label}
        </label>

        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          isError={!!errorText}
          errorMessage={errorText}
        />
        {children && <div className="mt-4">{children}</div>}
      </div>

      <div className="mt-5 flex gap-3.5">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onCancel}
          className="h-12 flex-1"
        >
          {cancelText}
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => {
            if (confirmDisabled) return;
            onConfirm();
          }}
          disabled={confirmDisabled}
          className="h-12 flex-1"
        >
          {confirmText}
        </Button>
      </div>
    </ModalBase>
  );
}
