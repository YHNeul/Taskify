// 모달 테스트용 페이지입니다.

'use client';

import { useState } from 'react';
import axios from 'axios';

import AlertModal from '@/components/modal/AlertModal';
import ConfirmModal from '@/components/modal/ConfirmModal';
import FormModal from '@/components/modal/FormModal';
import { inviteMember } from '@/api/dashboard';

type ModalType =
  | 'none'
  | 'alert'
  | 'confirm'
  | 'createColumn'
  | 'createColumnError'
  | 'manageColumn'
  | 'invite';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 테스트용 dashboardId
const TEST_DASHBOARD_ID = 1;

export default function ModalTestPage() {
  const [openModal, setOpenModal] = useState<ModalType>('none');
  const [columnName, setColumnName] = useState('새로운 프로젝트');
  const [duplicateName, setDuplicateName] = useState('To Do');
  const [manageName, setManageName] = useState('Done');

  const [email, setEmail] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => setOpenModal('none');

  const resetInviteModal = () => {
    setEmail('');
    setErrorText('');
    setIsSubmitting(false);
  };

  const closeInviteModal = () => {
    resetInviteModal();
    closeModal();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (!value.trim()) {
      setErrorText('');
      return;
    }

    if (!emailRegex.test(value.trim())) {
      setErrorText('이메일 형식으로 작성해 주세요.');
      return;
    }

    setErrorText('');
  };

  const handleInviteConfirm = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    if (!emailRegex.test(trimmedEmail)) {
      setErrorText('이메일 형식으로 작성해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorText('');

      await inviteMember(TEST_DASHBOARD_ID, trimmedEmail);

      closeInviteModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        if (message === '이미 대시보드에 초대된 멤버입니다.') {
          setErrorText('이미 대시보드에 초대된 멤버입니다.');
          return;
        }

        if (message === '이메일 형식이 올바르지 않습니다.') {
          setErrorText('이메일 형식으로 작성해 주세요.');
          return;
        }

        if (message === '대시보드 초대 권한이 없습니다.') {
          setErrorText('초대 권한이 없습니다.');
          return;
        }

        if (message === '대시보드가 존재하지 않습니다.') {
          setErrorText('대시보드를 찾을 수 없습니다.');
          return;
        }
      }

      setErrorText('초대에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInviteButtonDisabled = !email.trim() || !!errorText || isSubmitting;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F5F5] px-4 py-10">
      <h1 className="text-[24px] font-bold text-[#222222]">Modal Test Page</h1>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => setOpenModal('alert')}
          className="rounded-[12px] bg-[#5534DA] px-4 py-2 text-white"
        >
          원버튼 알림 모달
        </button>

        <button
          type="button"
          onClick={() => setOpenModal('confirm')}
          className="rounded-[12px] bg-[#5534DA] px-4 py-2 text-white"
        >
          투버튼 삭제 확인 모달
        </button>

        <button
          type="button"
          onClick={() => setOpenModal('createColumn')}
          className="rounded-[12px] bg-[#5534DA] px-4 py-2 text-white"
        >
          새 컬럼 생성 모달
        </button>

        <button
          type="button"
          onClick={() => setOpenModal('createColumnError')}
          className="rounded-[12px] bg-[#5534DA] px-4 py-2 text-white"
        >
          새 컬럼 생성 에러 모달
        </button>

        <button
          type="button"
          onClick={() => setOpenModal('manageColumn')}
          className="rounded-[12px] bg-[#5534DA] px-4 py-2 text-white"
        >
          컬럼 관리 모달
        </button>

        <button
          type="button"
          onClick={() => setOpenModal('invite')}
          className="rounded-[12px] bg-[#5534DA] px-4 py-2 text-white"
        >
          초대하기 모달
        </button>
      </div>

      {openModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          {openModal === 'alert' && (
            <AlertModal
              message="비밀번호가 일치하지 않습니다."
              buttonText="확인"
              onConfirm={closeModal}
            />
          )}

          {openModal === 'confirm' && (
            <ConfirmModal
              message="컬럼의 모든 카드가 삭제됩니다."
              cancelText="취소"
              confirmText="삭제"
              onCancel={closeModal}
              onConfirm={closeModal}
            />
          )}

          {openModal === 'createColumn' && (
            <FormModal
              title="새 컬럼 생성"
              label="이름"
              value={columnName}
              placeholder="새로운 프로젝트"
              cancelText="취소"
              confirmText="생성"
              onChange={setColumnName}
              onCancel={closeModal}
              onConfirm={closeModal}
            />
          )}

          {openModal === 'createColumnError' && (
            <FormModal
              title="새 컬럼 생성"
              label="이름"
              value={duplicateName}
              placeholder="새로운 프로젝트"
              cancelText="취소"
              confirmText="생성"
              errorText="중복된 컬럼 이름입니다."
              onChange={setDuplicateName}
              onCancel={closeModal}
              onConfirm={() => {}}
            />
          )}

          {openModal === 'manageColumn' && (
            <FormModal
              title="컬럼 관리"
              label="이름"
              value={manageName}
              cancelText="삭제"
              confirmText="변경"
              showCloseButton
              onChange={setManageName}
              onCancel={closeModal}
              onConfirm={closeModal}
              onClose={closeModal}
            />
          )}

          {openModal === 'invite' && (
            <FormModal
              title="초대하기"
              label="이메일"
              value={email}
              placeholder="이메일을 입력해 주세요"
              cancelText="취소"
              confirmText="초대"
              errorText={errorText}
              showCloseButton
              disabled={isInviteButtonDisabled}
              onChange={handleEmailChange}
              onCancel={closeInviteModal}
              onConfirm={handleInviteConfirm}
              onClose={closeInviteModal}
            />
          )}
        </div>
      )}
    </main>
  );
}
