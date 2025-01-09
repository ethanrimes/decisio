'use client'

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { SignOut } from '@/components/profile/SignOut';

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login');
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-gray-600">{session.user.email}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <SignOut />
        </div>
      </div>
    </div>
  );
}