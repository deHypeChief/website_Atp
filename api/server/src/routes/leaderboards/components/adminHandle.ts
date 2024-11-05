import Elysia from "elysia";
import { isAdmin_Authenticated } from "../../../middleware/isAdminAuth";
import Match from "../../match/model";
import Leader from "../model";
import User from "../../user/model";
import Notify from "../../notifications/model";
import Tournament from "../../tournament/model";
import { sendMail } from "../../../middleware/sendMail";

const adminHandleUsers = new Elysia()
  .use(isAdmin_Authenticated)
  .use(sendMail)
  .post("/createLeaders", async ({ generateAtpEmail, mailConfig, set, body }) => {
    const { gold, silver, bronze } = body;
    try {
      const [goldToken, silverToken, bronzeToken] = await Promise.all([
        Match.findOne({ token: gold }),
        Match.findOne({ token: silver }),
        Match.findOne({ token: bronze }),
      ]);

      if (!goldToken || !silverToken || !bronzeToken) {
        set.status = 400;
        return { message: "Invalid token(s) provided" };
      }

      const tour = await Tournament.findOne({ id: goldToken.tournament });
      const [goldUser, silverUser, bronzeUser] = await Promise.all([
        User.findById(goldToken.user),
        User.findById(silverToken.user),
        User.findById(bronzeToken.user),
      ]);

      if (!goldUser || !silverUser || !bronzeUser) {
        set.status = 400;
        return { message: "Error retrieving user data" };
      }

      // Create notifications
      const notifications = [
        Notify.create({
          userID: goldUser._id,
          title: "🏆 Congratulations on Winning Gold!",
          message: `Incredible job, ${goldUser.fullName}! You’ve won the **Gold** award in the ${tour?.name} tournament! Your unique winner's code is: ${gold}. Celebrate your victory! 🎉`,
          type: "info",
        }),
        Notify.create({
          userID: silverUser._id,
          title: "🥈 You’ve Won Silver!",
          message: `Amazing effort, ${silverUser.fullName}! You’ve earned the **Silver** award in the ${tour?.name} tournament! Your winner's code is: ${silver}. Be proud of your accomplishment! 🎊`,
          type: "info",
        }),
        Notify.create({
          userID: bronzeUser._id,
          title: "🥉 Bronze Award Winner!",
          message: `Great job, ${bronzeUser.fullName}! You’ve won the **Bronze** award in the ${tour?.name} tournament! Your winner's code is: ${bronze}. Cherish this as a reminder of your achievement! 🚀`,
          type: "info",
        }),
      ];
      await Promise.all(notifications);

      // Send emails
      const emails = [
        mailConfig(
          goldUser.email,
          `🏆 Congratulations on Winning Gold in the ATP Tournament: ${tour?.name}`,
          generateAtpEmail({
            title: "You've Won Gold in the ATP Tournament! 🏆",
            content: `
              <p>Hi ${goldUser.fullName},</p>
              <p>We're thrilled to announce that you are the <strong>Gold Winner</strong> in the <strong>${tour?.name}</strong> tournament! 🏅</p>
              <h1 style="color: #FFD60A; font-size: 4rem">${gold}</h1>
              <p>Hold onto this code as it certifies your incredible achievement. Congratulations once again, and keep shining!</p>
              <p>The ATP Tournament Team</p>
            `,
          })
        ),
        mailConfig(
          silverUser.email,
          `🥈 Congratulations on Winning Silver in the ATP Tournament: ${tour?.name}`,
          generateAtpEmail({
            title: "You've Won Silver in the ATP Tournament! 🥈",
            content: `
              <p>Hi ${silverUser.fullName},</p>
              <p>Congratulations on securing the <strong>Silver</strong> award in the <strong>${tour?.name}</strong> tournament! 🎉</p>
              <h1 style="color: #FFD60A; font-size: 4rem">${silver}</h1>
              <p>Congratulations once again, and we hope to see you back for the next tournament!</p>
              <p>The ATP Tournament Team</p>
            `,
          })
        ),
        mailConfig(
          bronzeUser.email,
          `🥉 Congratulations on Winning Bronze in the ATP Tournament: ${tour?.name}`,
          generateAtpEmail({
            title: "You've Won Bronze in the ATP Tournament! 🥉",
            content: `
              <p>Hi ${bronzeUser.fullName},</p>
              <p>Well done on achieving the <strong>Bronze</strong> award in the <strong>${tour?.name}</strong> tournament! 🚀</p>
              <h1 style="color: #FFD60A; font-size: 4rem">${bronze}</h1>
              <p>Congratulations once again, and keep up the fantastic work!</p>
              <p>The ATP Tournament Team</p>
            `,
          })
        ),
      ];
      await Promise.all(emails);

      // Update matches with medals
      const updateMatchPromises = [
        Match.findOneAndUpdate({ token: gold }, { won: true, medal: "gold" }, { new: true }),
        Match.findOneAndUpdate({ token: silver }, { won: true, medal: "silver" }, { new: true }),
        Match.findOneAndUpdate({ token: bronze }, { won: true, medal: "bronze" }, { new: true }),
      ];
      await Promise.all(updateMatchPromises);

      // Add to leaderboard
      const newLeader = new Leader({
        tour: tour?._id,
        gold: goldToken.user,
        silver: silverToken.user,
        bronze: bronzeToken.user,
      });
      await newLeader.save();

      return { message: "Leaders created successfully!" };
    } catch (err) {
      set.status = 500;
      return { message: "Error while creating leaders", error: err };
    }
  });
export default adminHandleUsers