'use client'

import dynamic from 'next/dynamic'

const NewApplicationForm = dynamic(() => import('@/components/NewApplicationForm'), { ssr: false })

interface PageProps {
  params: Promise<{ id: string }>
}

export default function NewApplicationPage({ params }: PageProps) {
  return <NewApplicationForm params={params} />
}