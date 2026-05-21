import Image from 'next/image';

export default function EmptyInvitation() {
  return (
    <div className="relative flex flex-col min-h-[327px] rounded-[16px] bg-white md:min-h-[390px]">
      <h2 className="absolute pt-[24px] px-[20px] text-gray-700 text-lg-bold md:px-[40px] md:text-2xl-bold">
        초대받은 대시보드
      </h2>
      <div className="flex-1 flex flex-col justify-center items-center">
        <Image
          className="w-[60px] h-auto md:w-[100px]"
          src="/icon-empty-invitation.svg"
          alt="초대받은 대시보드가 없습니다"
          width={100}
          height={100}
          priority
        />
        <p className="mt-[16px] text-gray-400 text-xs-regular md:mt-[24px] md:text-2lg-regular">
          아직 초대받은 대시보드가 없어요
        </p>
      </div>
    </div>
  );
}
