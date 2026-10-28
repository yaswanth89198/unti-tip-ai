import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SupportTicket } from '../types';
import {
  LifeBuoy, Plus, CheckCircle, Clock, AlertCircle,
  MessageSquare, UserCheck, X
} from 'lucide-react';

export const SupportTicketsView: React.FC = () => {
  const { db, createTicket, updateTicketStatus } = useData();
  const { currentUser, isStudent, canManageAcademics } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New ticket state
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('Missing or incorrect marks');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('Medium');

  // Resolve state
  const [resolveStatus, setResolveStatus] = useState<SupportTicket['status']>('Resolved');
  const [resolveNotes, setResolveNotes] = useState('');

  const currentEnrollment = isStudent && currentUser.associatedEnrollmentId ? currentUser.associatedEnrollmentId : '240101';

  const filteredTickets = db.tickets.filter(t => {
    if (isStudent && currentUser.associatedEnrollmentId) {
      if (t.enrollmentId !== currentUser.associatedEnrollmentId) return false;
    }
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    createTicket({
      enrollmentId: currentEnrollment,
      category: newCategory,
      subject: newSubject.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      assignedCoordinator: 'Academic Grievance Wing'
    });

    setIsCreateModalOpen(false);
    setNewSubject('');
    setNewDesc('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    updateTicketStatus(selectedTicket.ticketId, resolveStatus, resolveNotes);
    setSelectedTicket(null);
    setResolveNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Quick Support & Grievance Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Formal academic resolution workflow for marks discrepancies, attendance condonations, and credentials.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Raise Support Ticket
        </button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="Missing or incorrect marks">Missing or incorrect marks</option>
            <option value="Attendance disputes">Attendance disputes</option>
            <option value="Enrollment ID issues">Enrollment ID issues</option>
            <option value="Certificate or activity corrections">Certificate or activity corrections</option>
            <option value="Semester and subject information">Semester and subject information</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {filteredTickets.length} Tickets Found
        </span>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No support tickets match the current filters.
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const student = db.students.find(s => s.enrollmentId === ticket.enrollmentId);
            return (
              <div
                key={ticket.ticketId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {ticket.ticketId}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {ticket.category}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className={`text-xs font-bold ${
                        ticket.status === 'Resolved' || ticket.status === 'Closed'
                          ? 'text-emerald-700'
                          : ticket.status === 'In Progress'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{ticket.subject}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-2">
                      <span>Student: {student?.fullName} ({ticket.enrollmentId})</span>
                      <span>Created: {ticket.createdAt}</span>
                      <span>Assigned: {ticket.assignedCoordinator || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {canManageAcademics && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setResolveStatus(ticket.status === 'Open' ? 'In Progress' : 'Resolved');
                          setResolveNotes(ticket.resolutionNotes || '');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Update / Resolve
                      </button>
                    )}
                  </div>
                </div>

                {ticket.resolutionNotes && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-bold block mb-0.5">Resolution Notes:</span>
                    {ticket.resolutionNotes}
                    {ticket.resolvedAt && (
                      <span className="text-[10px] text-emerald-700 font-mono block mt-1">
                        Resolved on {ticket.resolvedAt}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Submit Academic Support Ticket</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter your grievance or inquiry details for departmental review.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grievance Category *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Missing or incorrect marks">Missing or incorrect marks</option>
                  <option value="Attendance disputes">Attendance disputes</option>
                  <option value="Enrollment ID issues">Enrollment ID issues</option>
                  <option value="Semester and subject information">Semester and subject information</option>
                  <option value="Profile and photograph updates">Profile and photograph updates</option>
                  <option value="Certificate or activity corrections">Certificate or activity corrections</option>
                  <option value="General technical support">General technical support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Header *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="e.g. Midterm 1 assignment 2 marks discrepancy in CS301"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Explanation *</label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Describe the issue, dates, professor name, and specific score differences..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coordinator Resolve Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Update Ticket #{selectedTicket.ticketId}
            </h2>
            <p className="text-xs text-slate-500 mb-4">{selectedTicket.subject}</p>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
                <select
                  value={resolveStatus}
                  onChange={e => setResolveStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Comments & Official Response *
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolveNotes}
                  onChange={e => setResolveNotes(e.target.value)}
                  placeholder="Record outcome of investigation, marks rectification details, or administrative advice..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
