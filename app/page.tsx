import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-between p-16 bg-white dark:bg-black sm:items-start">
        <Image src={'/logo.svg'} alt="logo" width={150} height={150} />
      </main>
    </div>
  );
}
