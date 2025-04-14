'use client';

import CellGroupForm from '../../components/CellGroupForm';
import Header from '../../components/Header';

export default function AddCellGroupPage() {
  return (
    <div>
      <Header title="Add New Cell Group" />
      <div className="card">
        <CellGroupForm mode="add" />
      </div>
    </div>
  );
}
