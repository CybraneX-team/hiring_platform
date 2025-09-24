"use client";

import dynamic from 'next/dynamic';

// Disable SSR for the ProfileTab component
const ProfileTab = dynamic(() => import('../components/profile-tab'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  )
});

export default function ProfilePage() {
  return <ProfileTab />;
}
