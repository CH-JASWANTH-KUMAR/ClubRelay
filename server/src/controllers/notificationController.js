import { Notification } from '../models/index.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      campusId: req.campusId,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({
      success: true,
      data: { notifications },
    });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { isRead: true },
      { new: true }
    );

    return res.json({
      success: true,
      data: { notification },
    });
  } catch (err) {
    next(err);
  }
}
