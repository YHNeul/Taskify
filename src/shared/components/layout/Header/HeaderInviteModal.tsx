import FormModal from '@/shared/components/modal/FormModal';
import ModalOverlay from '@/shared/components/common/ModalBase/ModalOverlay';

interface HeaderInviteModalProps {
  isOpen: boolean;
  email: string;
  error: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function HeaderInviteModal({
  isOpen,
  email,
  error,
  isDisabled,
  onChange,
  onClose,
  onConfirm,
}: HeaderInviteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClose={onClose}>
      <FormModal
        title="멤버 초대"
        label="이메일"
        value={email}
        placeholder="이메일을 입력해 주세요"
        cancelText="취소"
        confirmText="초대"
        errorText={error}
        showCloseButton
        disabled={isDisabled}
        onChange={onChange}
        onCancel={onClose}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </ModalOverlay>
  );
}
