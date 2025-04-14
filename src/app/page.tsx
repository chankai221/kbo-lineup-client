'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { db, auth } from '@/lib/firebaseConfig';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';

export default function LineupPage() {
  const [lineups, setLineups] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'lineups'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLineups(data);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'lineups', id));
    toast.success('삭제 완료');
  };

  return (
    <main className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white p-4 sm:p-8">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center flex-wrap gap-2 mb-6">
        <h1 className="text-2xl font-bold">📋 KBO 라인업 조회</h1>
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="border px-4 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? '다크 모드' : '라이트 모드'}
          </button>
        )}
      </div>

      {lineups.length === 0 && (
        <p className="text-gray-500 text-center">저장된 라인업이 없습니다.</p>
      )}

      {lineups.map((lineup) => (
        <div
          key={lineup.id}
          className="border border-gray-300 dark:border-gray-700 p-4 rounded mb-4 max-w-3xl mx-auto"
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">📅 {lineup.date} - {lineup.homeTeam} vs {lineup.awayTeam}</span>
            {isAdmin && (
              <button
                onClick={() => handleDelete(lineup.id)}
                className="text-red-400 hover:underline text-xs"
              >
                삭제
              </button>
            )}
          </div>
          <div className="mt-2">
            <div className="font-bold">{lineup.homeTeam}:</div>
            <div className="mb-1">{lineup.home?.map((p: any) => `${p.name}(${p.position})`).join(', ')}</div>
            <div className="font-bold">{lineup.awayTeam}:</div>
            <div>{lineup.away?.map((p: any) => `${p.name}(${p.position})`).join(', ')}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              🧤 선발투수: {lineup.homeTeam} - {lineup.homePitcher}, {lineup.awayTeam} - {lineup.awayPitcher}
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
