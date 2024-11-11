import Elysia from "elysia";
import { transporter } from "../config/nodemail.config";

export const sendMail = (app: Elysia) =>
  app
    .derive(async function handler({ set }) {
      function mailConfig(to: string, subject: string, html: string) {
        const mailOptions = {
          from: `"ATP Team" ${process.env.MAIL}`,
          to,
          subject,
          html,
        };

        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            set.status = 400
          } else {
            console.log('Email sent successfully:', info.response);
            set.status = 200
          }
        });
      }

      function generateAtpEmail(payload: { title: string; content: string; }): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Hello from ATP</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                }
                .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                .logo {
                  margin-bottom: 20px;
                  text-align: center;
                }
                .logo img {
                  max-width: 100px;
                }
                .header {
                  background-color: #92CD0C;
                  padding: 10px 20px;
                  text-align: center;
                }
                .header h1 {
                  color: #ffffff;
                  font-size: 28px;
                }
                .content {
                  padding: 20px;
                  color: #113858;
                  line-height: 1.6;
                }
                .content h2 {
                  color: #92CD0C;
                }
                button {
                  padding: 12px 30px;
                  font-size: 1rem;
                  background: none;
                  color: #113858; /* Matches --color-blue */
                  border: 2px solid #113858; /* Blue border */
                  font-weight: 600;
                  border-radius: 5px;
                  cursor: pointer;
                  text-align: center;
                  text-decoration: none;
                  display: inline-block;
                }
                .full {
                  width: 100%;
                }
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #888888;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <!-- Header -->
                <div class="header">
                  <h1>${payload.title}</h1>
                </div>
        
                <!-- Main Content -->
      
               ${payload.content}
        
                <!-- Footer -->
                <div class="footer">
                  <p>&copy; 2024 ATP. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `;
      }

      return {
        mailConfig,
        generateAtpEmail
      }
    })