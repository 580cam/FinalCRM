import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Approval Required | High Quality Moving CRM',
  description: 'Your account requires admin approval',
}

export default function AdminApprovalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
