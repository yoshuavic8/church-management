'use client';

import { Suspense } from 'react';
import Header from '../../components/Header';
import MinistryForm from '../components/MinistryForm';

function AddMinistryContent() {
  return (
    <div>
      <Header 
        title="Add New Ministry" 
        backTo="/ministries"
        backLabel="Ministries"
      />
      
      <MinistryForm />
    </div>
  );
}

export default function AddMinistryPage() {
  return (
    <Suspense fallback={<div className="p-4 flex justify-center items-center h-screen">Loading...</div>}>
      <AddMinistryContent />
    </Suspense>
  );
}
