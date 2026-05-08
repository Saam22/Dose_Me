// src/components/MedicationsTab.jsx
import React, { useState } from 'react';

export default function MedicationsTab({ userData, onUpdate }) {
  const [medications, setMedications] = useState([
    { id: 1, name: 'أسبرين', dose: '100mg', frequency: 'مرة يومياً', time: '08:00', remaining: '15 يوم', status: 'active' },
    { id: 2, name: 'باراسيتامول', dose: '500mg', frequency: 'عند الحاجة', time: 'حسب الألم', remaining: '30 يوم', status: 'active' },
    { id: 3, name: 'أتورفاستاتين', dose: '20mg', frequency: 'مرة يومياً', time: '20:00', remaining: '5 أيام', status: 'low' },
    { id: 4, name: 'ميتفورمين', dose: '500mg', frequency: 'مرتين يومياً', time: '08:00, 20:00', remaining: '12 يوم', status: 'active' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', time: '' });

  const addMedication = () => {
    if (newMed.name) {
      setMedications([...medications, { ...newMed, id: Date.now(), remaining: 'جديد', status: 'active' }]);
      setNewMed({ name: '', dose: '', frequency: '', time: '' });
      setShowAddForm(false);
    }
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  return (
    <div className="medications-tab">
      <div className="tab-header">
        <h2>💊 إدارة الأدوية</h2>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <span className="material-symbols-outlined">add</span>
          إضافة دواء
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <input type="text" placeholder="اسم الدواء" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
          <input type="text" placeholder="الجرعة" value={newMed.dose} onChange={e => setNewMed({...newMed, dose: e.target.value})} />
          <input type="text" placeholder="التكرار" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} />
          <input type="text" placeholder="الوقت" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} />
          <div className="form-actions">
            <button className="save-btn" onClick={addMedication}>حفظ</button>
            <button className="cancel-btn" onClick={() => setShowAddForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="medications-table-wrapper">
        <table className="med-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الجرعة</th>
              <th>التكرار</th>
              <th>الوقت</th>
              <th>المتبقي</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {medications.map(med => (
              <tr key={med.id}>
                <td><strong>{med.name}</strong></td>
                <td>{med.dose}</td>
                <td>{med.frequency}</td>
                <td>{med.time}</td>
                <td className={med.status === 'low' ? 'warning-text' : ''}>{med.remaining}</td>
                <td><button className="delete-btn" onClick={() => deleteMedication(med.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}