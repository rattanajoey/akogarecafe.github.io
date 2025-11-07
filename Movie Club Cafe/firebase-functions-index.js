/**
 * Firebase Cloud Functions for Movie Club Cafe
 * 
 * Setup Instructions:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Initialize functions: firebase init functions
 * 4. Copy this file to functions/index.js
 * 5. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Broadcast admin notifications to all users
 * Triggered when a new document is created in AdminNotifications collection
 */
exports.broadcastNotification = functions.firestore
  .document('AdminNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const db = admin.firestore();
    
    console.log('Broadcasting notification:', notification.title);
    
    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get();
      
      if (usersSnapshot.empty) {
        console.log('No users found to notify');
        return;
      }
      
      // Create notification for each user using batched writes
      const batchSize = 500; // Firestore batch limit
      const batches = [];
      let currentBatch = db.batch();
      let operationCount = 0;
      
      usersSnapshot.docs.forEach(userDoc => {
        const notificationRef = db
          .collection('users')
          .doc(userDoc.id)
          .collection('Notifications')
          .doc();
        
        currentBatch.set(notificationRef, {
          ...notification,
          isRead: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        operationCount++;
        
        // If batch is full, save it and create a new one
        if (operationCount >= batchSize) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationCount = 0;
        }
      });
      
      // Commit any remaining operations
      if (operationCount > 0) {
        batches.push(currentBatch.commit());
      }
      
      await Promise.all(batches);
      console.log(`Notification sent to ${usersSnapshot.docs.length} users`);
      
      // Send FCM push notifications
      const tokens = usersSnapshot.docs
        .map(doc => doc.data().fcmToken)
        .filter(token => token && token.trim() !== '');
      
      if (tokens.length > 0) {
        // FCM supports up to 500 tokens per multicast
        const tokenChunks = [];
        for (let i = 0; i < tokens.length; i += 500) {
          tokenChunks.push(tokens.slice(i, i + 500));
        }
        
        const sendPromises = tokenChunks.map(chunk => {
          const message = {
            notification: {
              title: notification.title,
              body: notification.body
            },
            data: {
              type: notification.type,
              timestamp: new Date().toISOString()
            },
            tokens: chunk
          };
          
          return admin.messaging().sendMulticast(message)
            .then(response => {
              console.log(`Successfully sent ${response.successCount} messages out of ${chunk.length}`);
              if (response.failureCount > 0) {
                console.log('Failed tokens:', response.responses
                  .filter(r => !r.success)
                  .map((r, i) => ({ token: chunk[i], error: r.error }))
                );
              }
              return response;
            });
        });
        
        await Promise.all(sendPromises);
      } else {
        console.log('No FCM tokens found');
      }
      
      console.log('Notification broadcast completed successfully');
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      throw error;
    }
  });

/**
 * Auto-notify when monthly selections are updated
 * Triggered when MonthlySelections document is created or updated
 */
exports.notifyMonthlySelectionUpdate = functions.firestore
  .document('MonthlySelections/{monthId}')
  .onWrite(async (change, context) => {
    // Don't notify on delete
    if (!change.after.exists) {
      console.log('Monthly selection deleted, no notification sent');
      return;
    }
    
    const monthId = context.params.monthId;
    const db = admin.firestore();
    
    // Format month for display (e.g., "2025-01" -> "January 2025")
    const formatMonth = (monthStr) => {
      const [year, month] = monthStr.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const formattedMonth = formatMonth(monthId);
    
    const notification = {
      title: "Monthly Selections Updated! 🍿",
      body: `Check out the new movie selections for ${formattedMonth}!`,
      type: "monthly_selection",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { month: monthId },
      isRead: false
    };
    
    try {
      await db.collection('AdminNotifications').add(notification);
      console.log(`Monthly selection notification created for ${monthId}`);
    } catch (error) {
      console.error('Error creating monthly selection notification:', error);
    }
  });

/**
 * Auto-notify when a new movie is submitted
 * Triggered when a new submission is created
 */
exports.notifyNewSubmission = functions.firestore
  .document('Submissions/{monthId}/users/{nickname}')
  .onCreate(async (snap, context) => {
    const { monthId, nickname } = context.params;
    const db = admin.firestore();
    
    const notification = {
      title: "New Movie Submission! 🎬",
      body: `${nickname} has submitted movies for ${monthId}!`,
      type: "new_submission",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { month: monthId, submitter: nickname },
      isRead: false
    };
    
    try {
      await db.collection('AdminNotifications').add(notification);
      console.log(`New submission notification created for ${nickname}`);
    } catch (error) {
      console.error('Error creating submission notification:', error);
    }
  });

/**
 * Clean up old notifications (run daily)
 * Deletes notifications older than 30 days
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 2 * * *') // Run at 2 AM daily
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get();
      let totalDeleted = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const notificationsRef = db.collection('users')
          .doc(userDoc.id)
          .collection('Notifications');
        
        const oldNotifications = await notificationsRef
          .where('timestamp', '<', thirtyDaysAgo)
          .where('isRead', '==', true)
          .get();
        
        if (!oldNotifications.empty) {
          const batch = db.batch();
          oldNotifications.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          totalDeleted += oldNotifications.docs.length;
        }
      }
      
      console.log(`Cleaned up ${totalDeleted} old notifications`);
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  });

/**
 * Update user's last seen timestamp when they interact with the app
 * Triggered when user document is updated
 */
exports.updateUserLastSeen = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    
    // Only update if user is going online or significant change
    if (after.isOnline && !before.isOnline) {
      return change.after.ref.update({
        lastSeen: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return null;
  });

