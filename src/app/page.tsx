// src/app/page.tsx

import APITester from '@/components/APITester';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">iREST API Tester</h1>
      <APITester />
    </div>
  );
}