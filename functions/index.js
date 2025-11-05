const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Triggered when a new delivery document is created.
 * Sends a push notification to all users except the one who created the delivery.
 */
exports.sendDeliveryNotification = functions.firestore
    .document("deliveries/{deliveryId}")
    .onCreate(async (snap, context) => {
      const newDelivery = snap.data();
      const creatorUid = newDelivery.createdByUid;

      if (!creatorUid) {
        console.log("No creator UID found in delivery document. Exiting.");
        return null;
      }

      console.log(`New delivery created by user: ${creatorUid}`);

      // Get all user documents from the 'users' collection
      const usersSnapshot = await db.collection("users").get();
      if (usersSnapshot.empty) {
        console.log("No users found to send notifications to.");
        return null;
      }

      const tokens = [];
      const tokenPromises = [];

      usersSnapshot.forEach((userDoc) => {
        // We only want to send notifications to users other than the creator
        if (userDoc.id !== creatorUid) {
          const promise = db.collection("users").doc(userDoc.id).collection("tokens").get()
              .then((tokensSnapshot) => {
                if (!tokensSnapshot.empty) {
                  tokensSnapshot.forEach((tokenDoc) => {
                    tokens.push(tokenDoc.data().token);
                  });
                }
              });
          tokenPromises.push(promise);
        }
      });

      await Promise.all(tokenPromises);

      if (tokens.length === 0) {
        console.log("No device tokens found to send notifications to.");
        return null;
      }

      console.log(`Sending notification to ${tokens.length} tokens.`);

      // Construct the notification payload
      const payload = {
        notification: {
          title: "New Delivery Added",
          body: `Invoice #${newDelivery.invoiceNumber}: ${newDelivery.productName} for ${newDelivery.customerName}.`,
          icon: "/firebase-logo.png",
        },
        webpush: {
          fcm_options: {
            // Clicking the notification will open/focus the app
            link: "/", 
          },
        },
      };
      
      try {
        // Send the notification to all collected tokens
        const response = await messaging.sendMulticast({ tokens, ...payload });
        console.log(`${response.successCount} messages were sent successfully`);

        // Optional: Clean up stale tokens
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(tokens[idx]);
            }
          });
          console.log("List of tokens that caused failures: " + failedTokens);
          // In a production app, you would implement logic here to remove these stale tokens from Firestore.
        }
      } catch (error) {
        console.error("Error sending notification:", error);
      }
      
      return null;
    });
