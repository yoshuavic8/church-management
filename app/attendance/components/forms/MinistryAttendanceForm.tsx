import React, { useState } from 'react';
import MinistryDetailsForm from './MinistryDetailsForm';
import { BaseAttendanceFormProps } from './BaseAttendanceForm';

type MinistryAttendanceFormProps = BaseAttendanceFormProps & {
  participants: any[];
  handleParticipantStatusChange: (memberId: string, status: string) => void;
};

type MinistryTask = {
  id: string;
  description: string;
  completed: boolean;
  assignedTo: string;
};

export default function MinistryAttendanceForm({
  participants,
  handleParticipantStatusChange,
  ...baseProps
}: MinistryAttendanceFormProps) {
  const [tasks, setTasks] = useState<MinistryTask[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');

  const handleAddTask = () => {
    if (!newTask.trim()) return;

    const task: MinistryTask = {
      id: Date.now().toString(),
      description: newTask,
      completed: false,
      assignedTo: selectedMember,
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setSelectedMember('');
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <>
      <MinistryDetailsForm {...baseProps} />

      {baseProps.contextId && (
        <>
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Ministry Tasks</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <label htmlFor="task_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description
                </label>
                <input
                  id="task_description"
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                  placeholder="Describe the task"
                />
              </div>

              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  id="assigned_to"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="input-field"
                  disabled={baseProps.saving || baseProps.success}
                >
                  <option value="">-- Select Member --</option>
                  {participants.map(member => (
                    <option key={member.member_id} value={member.member_id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="btn-secondary"
                  disabled={!newTask.trim() || baseProps.saving || baseProps.success}
                >
                  Add Task
                </button>
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Task List</h3>
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const assignedMember = participants.find(p => p.member_id === task.assignedTo);
                    const memberName = assignedMember
                      ? `${assignedMember.first_name} ${assignedMember.last_name}`
                      : 'Unassigned';

                    return (
                      <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTaskCompletion(task.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          disabled={baseProps.saving || baseProps.success}
                        />
                        <div className="ml-3 flex-grow">
                          <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.description}
                          </p>
                          <p className="text-sm text-gray-600">Assigned to: {memberName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={baseProps.saving || baseProps.success}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Member Attendance</h2>

            {participants.length === 0 ? (
              <p className="text-gray-500">No members found in this ministry.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.member_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {participant.first_name} {participant.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'present')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'present'
                                  ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'absent')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'absent'
                                  ? 'bg-red-100 text-red-800 ring-2 ring-red-600'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleParticipantStatusChange(participant.member_id, 'excused')}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                participant.status === 'excused'
                                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-600'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                              disabled={baseProps.saving || baseProps.success}
                            >
                              Excused
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
