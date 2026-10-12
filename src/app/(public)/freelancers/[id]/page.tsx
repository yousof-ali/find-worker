import SellerProfile from '@/components/SellerProfile';
import React from 'react';


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function FreelancerProfilePage({ params }: PageProps) {
  const { id } = await params;

  // We can pass customized or default data for the slug
  return <SellerProfile id = {id}/>;
}
