import ContactMessage from '../models/ContactMessage.js';
import AuditService from '../services/auditService.js';

/**
 * @desc Submit a public contact/inquiry message
 * @route POST /api/contact
 * @access Public
 */
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    const contactDoc = await ContactMessage.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '',
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      status: 'UNREAD'
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been received by Campus Security & Administration. We will respond promptly.',
      data: {
        id: contactDoc._id,
        createdAt: contactDoc.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get all contact messages (Admin)
 * @route GET /api/contact
 * @access Private (Admin)
 */
export const getContactMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      const q = req.query.search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } }
      ];
    }

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: messages,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update contact message status (Admin)
 * @route PATCH /api/contact/:id
 * @access Private (Admin)
 */
export const updateContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, replyNotes } = req.body;

    const contactDoc = await ContactMessage.findById(id);
    if (!contactDoc) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    if (status) contactDoc.status = status;
    if (replyNotes) {
      contactDoc.replyNotes = replyNotes;
      contactDoc.repliedBy = req.user?._id;
      contactDoc.repliedAt = new Date();
    }

    await contactDoc.save();

    await AuditService.log({
      actor: req.user?._id,
      actorEmail: req.user?.email,
      action: 'UPDATE_CONTACT_MESSAGE',
      entityType: 'ContactMessage',
      entityId: contactDoc._id.toString(),
      metadata: { status: contactDoc.status }
    });

    res.status(200).json({
      success: true,
      message: 'Contact message updated successfully.',
      data: contactDoc
    });
  } catch (err) {
    next(err);
  }
};
