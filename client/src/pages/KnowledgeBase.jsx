import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  BookOpen,
  Search,
  Plus,
  History,
  FileText,
  Tag,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function KnowledgeBase() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'SOP',
    content: '',
    tags: '',
  });

  const [editForm, setEditForm] = useState({
    content: '',
    changeSummary: '',
  });

  const listRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.knowledge-item-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: (el, i) => i * 30,
        ease: 'easeOutQuad',
      });
    },
    [categoryFilter, items.length]
  );

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/v1/clubs/${clubId}/knowledge?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data.items || []);
        if (json.data.items?.length > 0 && !selectedItem) {
          setSelectedItem(json.data.items[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) fetchKnowledge();
  }, [clubId, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKnowledge();
  };

  const handleCreateKnowledge = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          tags: createForm.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create record');

      addToast(`Preserved "${json.data.item.title}" into Organization Memory`, 'success');
      setShowCreateModal(false);
      setCreateForm({ title: '', category: 'SOP', content: '', tags: '' });
      fetchKnowledge();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateKnowledge = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/knowledge/${selectedItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update record');

      addToast(`Updated to version ${json.data.item.version}`, 'success');
      setShowEditModal(false);
      setSelectedItem(json.data.item);
      fetchKnowledge();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Memory & Institutional Knowledge"
        subtitle="Persistent operational records, standard operating procedures, and reusable playbooks"
        actions={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Add SOP or Playbook
          </Button>
        }
      />

      {/* Security Notice Reminder */}
      <div className="flex items-center gap-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span>
          <strong>Security Policy:</strong> Never store account passwords or authentication credentials in knowledge records. Use Bitwarden/1Password vault ownership transfers instead.
        </span>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operational memory (e.g. WiFi, Auditorium, Permit)..."
            className="pl-9 pr-4 py-1.5 text-xs"
          />
          <Search className="w-4 h-4 text-charcoal-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </form>

        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {['ALL', 'SOP', 'EVENT_PLAYBOOK', 'PROCESS', 'LESSONS_LEARNED', 'BUDGET_GUIDE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-forest-700 text-white font-semibold'
                  : 'text-charcoal-600 hover:bg-subtle'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Left = List of Documents; Right = Document Viewer & Version History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Cards (5 cols) */}
        <div ref={listRef} className="lg:col-span-5 space-y-3">
          {items.length === 0 ? (
            <Card className="text-center py-10 text-xs text-charcoal-400">
              No matching knowledge records found.
            </Card>
          ) : (
            items.map((item) => {
              const isSelected = selectedItem?._id === item._id;
              return (
                <Card
                  key={item._id}
                  hover
                  onClick={() => setSelectedItem(item)}
                  className={`knowledge-item-card cursor-pointer p-3.5 transition-colors ${
                    isSelected ? 'border-forest-700 ring-1 ring-forest-700 bg-forest-50/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="default" size="sm">
                      {item.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-charcoal-400">v{item.version}</span>
                  </div>

                  <h4 className="text-xs font-bold text-charcoal-900 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-charcoal-500 line-clamp-2 mt-1 mb-2">{item.content}</p>

                  <div className="flex items-center justify-between text-[10px] text-charcoal-400 border-t border-border pt-2">
                    <span className="truncate">Author: {item.authorId?.fullName}</span>
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Document Details & Version History (7 cols) */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <Card className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between pb-4 border-b border-border mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="approved" size="sm">
                        {selectedItem.category.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-charcoal-500">
                        Version {selectedItem.version}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-charcoal-900">{selectedItem.title}</h3>
                    <p className="text-[11px] text-charcoal-500 mt-0.5">
                      Last edited by {selectedItem.authorId?.fullName} on{' '}
                      {new Date(selectedItem.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowVersionModal(true)}
                    >
                      <History className="w-3.5 h-3.5" /> History ({selectedItem.revisionHistory?.length || 1})
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditForm({
                          content: selectedItem.content,
                          changeSummary: '',
                        });
                        setShowEditModal(true);
                      }}
                    >
                      Edit Document
                    </Button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="prose prose-sm max-w-none text-xs text-charcoal-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedItem.content}
                </div>

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-border">
                    <Tag className="w-3.5 h-3.5 text-charcoal-400" />
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-subtle border border-border px-2 py-0.5 rounded text-charcoal-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center text-xs text-charcoal-400">
              Select a knowledge record to read.
            </Card>
          )}
        </div>
      </div>

      {/* Create SOP Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Standard Operating Procedure or Playbook"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateKnowledge} className="space-y-4">
          <Input
            label="Document Title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="e.g. SOP: Booking Central Campus Auditorium"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              options={[
                { label: 'Standard Operating Procedure (SOP)', value: 'SOP' },
                { label: 'Event Execution Playbook', value: 'EVENT_PLAYBOOK' },
                { label: 'Process Guide', value: 'PROCESS' },
                { label: 'Lessons Learned Retrospective', value: 'LESSONS_LEARNED' },
                { label: 'Budget & Finance Guide', value: 'BUDGET_GUIDE' },
                { label: 'Venue Intel', value: 'VENUE_INTEL' },
              ]}
            />
            <Input
              label="Tags (Comma separated)"
              value={createForm.tags}
              onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
              placeholder="e.g. Facilities, Permits, AV"
            />
          </div>

          <Textarea
            label="Document Content (Markdown supported)"
            value={createForm.content}
            onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
            placeholder="Document the exact steps, required approvals, vendor contacts, and lead times..."
            rows={10}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Preserve into Memory</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Knowledge Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit "${selectedItem?.title}"`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateKnowledge} className="space-y-4">
          <Input
            label="Revision Change Summary (Mandatory)"
            value={editForm.changeSummary}
            onChange={(e) => setEditForm({ ...editForm, changeSummary: e.target.value })}
            placeholder="e.g. Updated custodial deposit amount from $100 to $150"
            required
          />

          <Textarea
            label="Content"
            value={editForm.content}
            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
            rows={10}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Revision (v{(selectedItem?.version || 1) + 1})</Button>
          </div>
        </form>
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title={`Version History — ${selectedItem?.title}`}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto text-xs">
          {selectedItem?.revisionHistory?.map((rev, idx) => (
            <div key={idx} className="p-3 rounded border border-border bg-subtle/50 space-y-1">
              <div className="flex items-center justify-between font-semibold text-charcoal-900">
                <span>Version {rev.version}</span>
                <span className="text-[11px] text-charcoal-400 font-normal">
                  {new Date(rev.editedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-charcoal-700 italic">"{rev.changeSummary || 'No summary'}"</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

