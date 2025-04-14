'use client';

import DistrictForm from '../../components/DistrictForm';
import Header from '../../components/Header';

export default function AddDistrictPage() {
  return (
    <div>
      <Header title="Add New District" />
      <div className="card">
        <DistrictForm mode="add" />
      </div>
    </div>
  );
}
