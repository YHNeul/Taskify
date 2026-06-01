import Image from 'next/image';

export default function EmptyInvitation() {
  return (
    <div className="relative flex flex-col min-h-80 rounded-card-sm bg-white md:min-h-96 md:rounded-card-md lg:rounded-card-lg">
      <h2 className="absolute pt-6 px-5 text-gray-700 text-md-bold md:px-10 md:text-lg-bold lg:text-xl-bold">
        초대받은 대시보드
      </h2>
      <div className="flex-1 flex flex-col justify-center items-center">
        <Image
          className="w-15 h-auto md:w-24"
          src="/icon-empty-invitation.svg"
          alt="초대받은 대시보드가 없습니다"
          width={100}
          height={100}
          priority
        />
        <p className="mt-4 text-gray-400 text-xs-regular md:mt-6 md:text-2lg-regular">
          아직 초대받은 대시보드가 없어요
        </p>
      </div>
    </div>
  );
}
