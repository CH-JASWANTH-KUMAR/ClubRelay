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
  Users,
  Plus,
  Star,
  Mail,
  Phone,
  Clock,
  DollarSign,
  Tag,
  Building,
} from 'lucide-react';

export function Directory() {
  const { clubId } = useParams();
  const { addToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    contactType: 'VENDOR',
    organizationName: '',
    primaryContactName: '',
    email: '',
    phone: '',
    servicesOffered: '',
    pricingNotes: '',
    leadTimeDays: 7,
    rating: 5,
    notes: '',
  });

  const cardsRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.contact-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: (el, i) => i * 30,
        ease: 'easeOutQuad',
      });
    },
    [filterType, contacts.length]
  );

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/clubs/${clubId}/contacts${filterType !== 'ALL' ? `?type=${filterType}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setContacts(json.data.contacts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) fetchContacts();
  }, [clubId, filterType]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to add contact');

      addToast(`Added "${json.data.contact.organizationName}" to Directory`, 'success');
      setShowAddModal(false);
      setFormData({
        contactType: 'VENDOR',
        organizationName: '',
        primaryContactName: '',
        email: '',
        phone: '',
        servicesOffered: '',
        pricingNotes: '',
        leadTimeDays: 7,
        rating: 5,
        notes: '',
      });
      fetchContacts();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div ref={cardsRef} className="space-y-6">
      <PageHeader
        title="Sponsor, Vendor & Partner Network"
        subtitle="Preserve reliable vendor pricing, catering contacts, and corporate partner relationships"
        actions={
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Partner / Vendor
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2 text-xs font-medium">
        {['ALL', 'SPONSOR', 'VENDOR', 'SPEAKER', 'MENTOR'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              filterType === type
                ? 'bg-forest-700 text-white font-semibold'
                : 'text-charcoal-600 hover:bg-subtle'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Contacts Grid */}
      {contacts.length === 0 ? (
        <Card className="text-center py-12 text-xs text-charcoal-400">
          No contacts recorded in this category.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <Card key={c._id} hover className="contact-card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={c.contactType === 'SPONSOR' ? 'approved' : 'default'} size="sm">
                    {c.contactType}
                  </Badge>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: c.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-charcoal-900">{c.organizationName}</h3>
                {c.primaryContactName && (
                  <p className="text-xs text-charcoal-600 font-medium mt-0.5">{c.primaryContactName}</p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-charcoal-600 border-t border-border pt-3">
                  {c.email && (
                    <div className="flex items-center gap-2 text-charcoal-700">
                      <Mail className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                      <a href={`mailto:${c.email}`} className="hover:underline truncate">
                        {c.email}
                      </a>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-charcoal-700">
                      <Phone className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.leadTimeDays && (
                    <div className="flex items-center gap-2 text-charcoal-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
                      <span>{c.leadTimeDays} days lead time recommended</span>
                    </div>
                  )}
                </div>

                {c.servicesOffered && (
                  <div className="mt-2 text-xs bg-subtle p-2 rounded text-charcoal-700">
                    <span className="font-semibold block text-[10px] text-charcoal-400 uppercase">
                      Services:
                    </span>
                    {c.servicesOffered}
                  </div>
                )}

                {c.pricingNotes && (
                  <div className="mt-2 text-[11px] text-charcoal-600">
                    <span className="font-semibold text-charcoal-800">Pricing / Terms: </span>
                    {c.pricingNotes}
                  </div>
                )}
              </div>

              {c.notes && (
                <div className="mt-3 pt-2 border-t border-border text-[11px] text-charcoal-500 italic">
                  "{c.notes}"
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Partner Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Partner or Vendor">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Contact Type"
              value={formData.contactType}
              onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
              options={[
                { label: 'Sponsor / Corporate Partner', value: 'SPONSOR' },
                { label: 'Vendor / Contractor', value: 'VENDOR' },
                { label: 'Guest Speaker', value: 'SPEAKER' },
                { label: 'Industry Mentor', value: 'MENTOR' },
              ]}
            />
            <Input
              label="Reliability Rating (1-5)"
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Organization / Company Name"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            placeholder="e.g. Campus Printing Express"
            required
          />

          <Input
            label="Primary Contact Person"
            value={formData.primaryContactName}
            onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
            placeholder="e.g. Maria Gonzalez (Store Manager)"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="orders@printing.com"
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
            />
          </div>

          <Input
            label="Services Offered"
            value={formData.servicesOffered}
            onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
            placeholder="Large format vinyl banners, laser name badges, lanyards"
          />

          <Textarea
            label="Pricing, Discount Codes & Operational Notes"
            value={formData.pricingNotes}
            onChange={(e) => setFormData({ ...formData, pricingNotes: e.target.value })}
            placeholder="Student discount code: PCU-STUDENT-10. Requires 5 business days advance notice."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Partner Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

