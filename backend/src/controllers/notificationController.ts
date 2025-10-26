import { Request, Response } from "express";
import prisma from "../config/prisma";

// Get all notifications
export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const userNotifications = await prisma.notification.findMany({
      where: { userid: currentUserId },
      orderBy: { createdat: "desc" },
    });
    if (!userNotifications) {
      return res.status(400).json({ error: "Failed to get notifications" });
    }
    return res.status(200).json({
      message: `${userNotifications.length} notifications found`,
      userNotifications,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Read a notification
export const readNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notificationExists = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notificationExists) {
      return res.status(404).json({ error: "Notification not found" });
    }
    const readNotif = await prisma.notification.update({
      where: { id: notificationId },
      data: { isread: true },
    });
    if (!readNotif) {
      return res.status(400).json({ error: "Something went wrong" });
    }
    return res.status(200).json({ message: "Notification updated", readNotif });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const notificationExists = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notificationExists) {
      return res.status(404).json({ error: "Notification not found" });
    }
    const deleteNotif = await prisma.notification.delete({
      where: { id: notificationId },
    });
    if (!deleteNotif) {
      return res.status(400).json({ error: "Something went wrong" });
    }
    return res
      .status(200)
      .json({ message: "Notification updated", deleteNotif });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Read all notifications
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const readAllNotif = await prisma.notification.updateMany({
      where: { userid: currentUserId, isread: false },
      data: {
        isread: true,
      },
    });
    if (!readAllNotif) {
      return res.status(400).json({ error: "Something went wrong" });
    }
    return res
      .status(200)
      .json({ message: "All notifications are marked as read", readAllNotif });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const deleteAllNotif = await prisma.notification.deleteMany({
      where: { userid: currentUserId },
    });
    if (!deleteAllNotif) {
      return res.status(400).json({ error: "Something went wrong" });
    }
    return res.status(200).json({
      message: "All notifications are marked as read",
      deleteAllNotif,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
