import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Your Email | High Quality Moving CRM',
  description: 'Please verify your email address to continue',
}

export default function EmailVerificationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
