// src/components/IndicatorsTab.jsx
import React, { useState } from 'react';

export default function IndicatorsTab({ userData, onUpdate }) {
  const [readings, setReadings] = useState([
    { date: '2024-01-20', bp: '120/80', hr: 72, weight: 75, sugar: 110 },
    { date: '2024-01-19', bp: '125/82', hr: 75, weight: 75.5, sugar: 115 },
    { date: '2024-01-18', bp: '118/78', hr: 70, weight: 76, sugar: 108 },
    { date: '2024-01-17', bp: '130/85', hr: 78, weight: 75.8, sugar: 120 },
    { date: '2024-01-16', bp: '122/79', hr: 71, weight: 75.2, sugar: 112 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newReading, setNewReading] = useState({ bp: '', hr: '', weight: '', sugar: '' });

  const addReading = () => {
    if (newReading.bp && newReading.hr) {
      setReadings([{
        date: new Date().toISOString().split('T')[0],
        ...newReading
      }, ...readings]);
      setNewReading({ bp: '', hr: '', weight: '', sugar: '' });
      setShowForm(false);
    }
  };

  const getBpStatus = (bp) => {
    const systolic = parseInt(bp.split('/')[0]);
    if (systolic > 130) return 'warning';
    if (systolic > 120) return 'caution';
    return 'normal';
  };

  return (
    <div className="indicators-tab">
      <div className="tab-header">
        <h2>📊 المؤشرات الحيوية</h2>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          <span className="material-symbols-outlined">add</span>
          تسجيل قراءة
        </button>
      </div>

      {showForm && (
        <div className="add-reading-form">
          <div className="form-row">
            <input type="text" placeholder="ضغط الدم (مثال: 120/80)" value={newReading.bp} onChange={e => setNewReading({...newReading, bp: e.target.value})} />
            <input type="number" placeholder="معدل النبض" value={newReading.hr} onChange={e => setNewReading({...newReading, hr: e.target.value})} />
          </div>
          <div className="form-row">
            <input type="number" placeholder="الوزن (كجم)" value={newReading.weight} onChange={e => setNewReading({...newReading, weight: e.target.value})} />
            <input type="number" placeholder="سكر الدم" value={newReading.sugar} onChange={e => setNewReading({...newReading, sugar: e.target.value})} />
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={addReading}>حفظ</button>
            <button className="cancel-btn" onClick={() => setShowForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="readings-table-wrapper">
        <table className="readings-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>ضغط الدم</th>
              <th>النبض</th>
              <th>الوزن</th>
              <th>السكر</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td className={`bp-${getBpStatus(r.bp)}`}>{r.bp}</td>
                <td className={r.hr > 100 ? 'warning' : ''}>{r.hr}</td>
                <td>{r.weight}</td>
                <td className={r.sugar > 140 ? 'warning' : ''}>{r.sugar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}