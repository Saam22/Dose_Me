// src/components/TreatmentPlanTab.jsx
import React, { useState } from 'react';

export default function TreatmentPlanTab({ userData }) {
  const [plan] = useState({
    doctor: 'د. أحمد محمد',
    diagnosis: userData?.conditions?.join(', ') || 'ارتفاع ضغط الدم',
    startDate: '2024-01-15',
    endDate: '2024-06-15',
    notes: 'الالتزام بالجرعات المنتظمة وممارسة الرياضة يومياً'
  });

  const [checklist, setChecklist] = useState([
    { id: 1, task: 'قياس ضغط الدم صباحاً', completed: true },
    { id: 2, task: 'تناول الدواء بعد الإفطار', completed: false },
    { id: 3, task: 'تسجيل القراءات في التطبيق', completed: true },
    { id: 4, task: 'ممارسة رياضة المشي 30 دقيقة', completed: false },
    { id: 5, task: 'تجنب الأطعمة المالحة', completed: false },
  ]);

  const toggleTask = (id) => {
    setChecklist(checklist.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const progress = Math.round((checklist.filter(t => t.completed).length / checklist.length) * 100);

  return (
    <div className="treatment-tab">
      <div className="tab-header">
        <h2>📋 الخطة العلاجية</h2>
      </div>

      <div className="plan-card">
        <div className="plan-info">
          <div className="info-row">
            <span className="info-label">👨‍⚕️ الطبيب المعالج:</span>
            <span className="info-value">{plan.doctor}</span>
          </div>
          <div className="info-row">
            <span className="info-label">📝 التشخيص:</span>
            <span className="info-value">{plan.diagnosis}</span>
          </div>
          <div className="info-row">
            <span className="info-label">📅 فترة العلاج:</span>
            <span className="info-value">{plan.startDate} → {plan.endDate}</span>
          </div>
          <div className="info-row">
            <span className="info-label">💡 ملاحظات:</span>
            <span className="info-value">{plan.notes}</span>
          </div>
        </div>
      </div>

      <div className="checklist-section">
        <div className="checklist-header">
          <h3>✅ قائمة المتابعة اليومية</h3>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e0e0e0" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4CAF50" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
              <text x="18" y="20.5" className="progress-text">{progress}%</text>
            </svg>
          </div>
        </div>
        
        <div className="checklist">
          {checklist.map(task => (
            <label key={task.id} className={`checklist-item ${task.completed ? 'completed' : ''}`}>
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
              <span>{task.task}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}