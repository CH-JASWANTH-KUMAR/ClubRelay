import { z } from 'zod';
import { Contact, AuditLog } from '../models/index.js';

const contactSchema = z.object({
  contactType: z.enum(['SPONSOR', 'VENDOR', 'SPEAKER', 'MENTOR']),
  organizationName: z.string().min(2),
  primaryContactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  servicesOffered: z.string().optional(),
  pricingNotes: z.string().optional(),
  leadTimeDays: z.number().optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export async function listContacts(req, res, next) {
  try {
    const filter = {
      clubId: req.params.clubId,
      campusId: req.campusId,
    };
    if (req.query.type) {
      filter.contactType = req.query.type;
    }

    const contacts = await Contact.find(filter).sort({ rating: -1, organizationName: 1 });
    return res.json({
      success: true,
      data: { contacts },
    });
  } catch (err) {
    next(err);
  }
}

export async function createContact(req, res, next) {
  try {
    const data = contactSchema.parse(req.body);

    const contact = await Contact.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      ...data,
    });

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'CONTACT_ADDED',
      targetType: 'Contact',
      targetId: contact._id,
      metadata: { organizationName: contact.organizationName, type: contact.contactType },
    });

    return res.status(201).json({
      success: true,
      data: { contact },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const updates = req.body;
    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        clubId: req.params.clubId,
        campusId: req.campusId,
      },
      updates,
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found.' },
      });
    }

    return res.json({
      success: true,
      data: { contact },
    });
  } catch (err) {
    next(err);
  }
}
