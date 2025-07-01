import Elysia from "elysia";
import { isUser_Authenticated } from "../../../middleware/isUserAuth";
import { sendMail } from "../../../middleware/sendMail";
import User from "../model";
import { Subscription } from "../../subscriptions/model";
import CoachAssignment from "../../coachAssigments/model";
import Notify from "../../notifications/model";
import Transaction from "../../transactions/model";
import Match from "../../match/model";
import Leader from "../../leaderboards/model";
import Coach from "../../coach/model";
import { CustomMatch } from "../../customMatch/model";
import ResetToken from "../resetToken.model";

const getUser = new Elysia()
    .use(isUser_Authenticated)
    .use(sendMail)
    .get("/me", async ({ set, user }) => {
        try {
            const userData = await User.findById(user._id)
                .select("-password") // Exclude the password field
                .populate({
                    path: "assignedCoach",
                    populate: {
                        path: "comment.userID", // Nested populate within assignedCoach for comment userID
                        model: "User", // Specify the model if needed for clarity
                        select: "-password"
                    }
                })
                
            set.status = 200; // Status 200 on success
            return {
                message: "User found",
                userData
            };
        } catch (err) {
            set.status = 500;
            return {
                message: "Error getting user",
                err
            };
        }
    })
    .post("/uploadProfile", async ({set, user, body}: {set: any, user: any, body: any})=>{
        const {profileImage} = body
        const {_id} = user
        try{
            const userData = await User.findByIdAndUpdate(
                {_id},
                {
                    picture: profileImage
                },
                {new: true}
            )
            set.status = 200; // Status 200 on success
            return {
                message: "User updated",
                userData
            };
        }catch(err){
            set.status = 500;
            return {
                message: "Error updating user profile",
                err
            };
        }
    })
    .delete("/delUserData", async ({ set, user, mailConfig, generateAtpEmail }: {set: any, user: any, mailConfig: any, generateAtpEmail: any}) => {
        const userId = user._id;
        
        try {
            console.log(`Starting deletion process for user: ${userId}`);
            
            // Get user data for email before deletion
            const userData = await User.findById(userId).select('email fullName');
            if (!userData) {
                set.status = 404;
                return {
                    message: "User not found",
                    userId
                };
            }

            // Send confirmation email before deletion
            const deletionDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            mailConfig(
                userData.email,
                "Account Deletion Confirmation - ATP",
                generateAtpEmail({
                    title: "Account Successfully Deleted",
                    content: `
                        <p>Dear ${userData.fullName},</p>
                        <p>Your ATP account has been <strong>permanently deleted</strong> as requested on ${deletionDate}.</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #dc3545; margin-top: 0;">What was removed:</h3>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Your profile and personal information</li>
                                <li>All membership and training subscriptions</li>
                                <li>Match history and tournament records</li>
                                <li>Payment history and billing information</li>
                                <li>Coach assignments and reviews</li>
                                <li>Notifications and preferences</li>
                            </ul>
                        </div>

                        <p>All your data has been permanently removed from our systems and cannot be recovered.</p>
        
                        
                        <p>Thank you for being part of the ATP community. We're sorry to see you go!</p>
                        
                        <p>Best regards,<br>The ATP Team</p>
                    `
                })
            );

            // Keep track of deletion results
            const deletionResults: { [key: string]: any } = {};

            // 1. Delete user's reset tokens
            deletionResults.resetTokens = await ResetToken.deleteMany({ userId });
            console.log(`Deleted ${deletionResults.resetTokens.deletedCount} reset tokens`);

            // 2. Delete user's notifications
            deletionResults.notifications = await Notify.deleteMany({ userID: userId });
            console.log(`Deleted ${deletionResults.notifications.deletedCount} notifications`);

            // 3. Delete user's transactions
            deletionResults.transactions = await Transaction.deleteMany({ user: userId });
            console.log(`Deleted ${deletionResults.transactions.deletedCount} transactions`);

            // 4. Delete user's match records
            deletionResults.matches = await Match.deleteMany({ user: userId });
            console.log(`Deleted ${deletionResults.matches.deletedCount} matches`);

            // 5. Delete user's coach assignments (where user is the player)
            deletionResults.coachAssignments = await CoachAssignment.deleteMany({ playerId: userId });
            console.log(`Deleted ${deletionResults.coachAssignments.deletedCount} coach assignments`);

            // 6. Delete user's subscription/billing data
            deletionResults.subscription = await Subscription.deleteMany({ user: userId });
            console.log(`Deleted ${deletionResults.subscription.deletedCount} subscriptions`);

            // 7. Delete user's custom match participations
            deletionResults.customMatches = await CustomMatch.deleteMany({
                'participants.userId': userId.toString()
            });
            console.log(`Deleted ${deletionResults.customMatches.deletedCount} custom matches`);

            // 8. Remove user from leaderboard records
            // Since leaderboards reference users by ObjectId, we need to handle this carefully
            // We'll delete leaderboard entries where the user won any position
            deletionResults.leaderboards = await Leader.deleteMany({
                $or: [
                    { gold: userId },
                    { silver: userId },
                    { bronze: userId }
                ]
            });
            console.log(`Deleted ${deletionResults.leaderboards.deletedCount} leaderboard entries`);

            // 9. Remove user's comments from all coaches
            const coaches = await Coach.find({ 'comment.userID': userId });
            let totalCommentsRemoved = 0;
            
            for (const coach of coaches) {
                const originalCommentCount = coach.comment.length;
                coach.comment = coach.comment.filter(comment => 
                    comment.userID.toString() !== userId.toString()
                );
                const commentsRemoved = originalCommentCount - coach.comment.length;
                totalCommentsRemoved += commentsRemoved;

                // Recalculate average rating after removing user's comments
                if (coach.comment.length > 0) {
                    const totalRating = coach.comment.reduce((sum, comment) => sum + comment.rating, 0);
                    coach.avgRate = totalRating / coach.comment.length;
                } else {
                    coach.avgRate = 0;
                }

                await coach.save();
            }
            deletionResults.coachComments = { removedCount: totalCommentsRemoved };
            console.log(`Removed ${totalCommentsRemoved} comments from coaches`);

            // 10. Finally, delete the user record itself
            deletionResults.user = await User.findByIdAndDelete(userId);
            console.log(`Deleted user record: ${deletionResults.user ? 'Success' : 'Not found'}`);

            set.status = 200;
            return {
                message: "User data completely deleted from all collections",
                emailSent: true,
                userEmail: userData.email,
                deletionSummary: {
                    userId,
                    userDeleted: !!deletionResults.user,
                    resetTokensDeleted: deletionResults.resetTokens.deletedCount,
                    notificationsDeleted: deletionResults.notifications.deletedCount,
                    transactionsDeleted: deletionResults.transactions.deletedCount,
                    matchesDeleted: deletionResults.matches.deletedCount,
                    coachAssignmentsDeleted: deletionResults.coachAssignments.deletedCount,
                    subscriptionsDeleted: deletionResults.subscription.deletedCount,
                    customMatchesDeleted: deletionResults.customMatches.deletedCount,
                    leaderboardsDeleted: deletionResults.leaderboards.deletedCount,
                    coachCommentsRemoved: deletionResults.coachComments.removedCount,
                    totalCollectionsAffected: 9
                }
            };

        } catch (err) {
            console.error(`Error deleting user data for ${userId}:`, err);
            
            // Try to send error notification email if we have user data
            try {
                const userData = await User.findById(userId).select('email fullName');
                if (userData && mailConfig) {
                    mailConfig(
                        userData.email,
                        "Account Deletion Error - ATP",
                        generateAtpEmail({
                            title: "Account Deletion Failed",
                            content: `
                                <p>Dear ${userData.fullName},</p>
                                <p>We encountered an error while trying to delete your ATP account.</p>
                                <p>Your account and data remain intact. Please try again later or contact our support team at <a href="mailto:support@atp.com">support@atp.com</a> for assistance.</p>
                                <p>We apologize for any inconvenience.</p>
                                <p>Best regards,<br>The ATP Team</p>
                            `
                        })
                    );
                }
            } catch (emailError) {
                console.error('Failed to send error notification email:', emailError);
            }

            set.status = 500;
            return {
                message: "Error deleting user data",
                error: err,
                userId
            };
        }
    })

export default getUser;