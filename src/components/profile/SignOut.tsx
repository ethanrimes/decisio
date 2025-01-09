'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function SignOut() {
  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  return (
    <Button 
      variant="outline" 
      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  )
}
