import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

// Inngest Function to Send Email on Task Creation
const sendBookingConfirmationEmail = inngest.createFunction({ id: "send-task-assignment-mail" }, { event: "app/task.assigned" }, async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { assignee: true, project: true },
    });

    await sendEmail({
        to: task.assignee.email,
        subject: `New Task Assignment in ${task.project.name}`,
        body: `
                    <div style="max-width: 600px;">
                    <h2>Hi ${task.assignee.name}, 👋</h2>
                    
                    <p style="font-size: 16px;">You've been assigned a new task:</p>
                    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${task.title}</p>
                    
                    <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
                        <p style="margin: 6px 0;"><strong>Description:</strong> ${task.description}</p>
                        <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
                    </div>
                    
                    <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
                        View Task
                    </a>

                    <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
                        Please make sure to review and complete it before the due date.
                    </p>
                    </div>
                    `,
    });

    if (new Date(task.due_date).toDateString() !== new Date().toDateString()) {
        await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));

        await step.run("check-if-task-is-completed ", async () => {
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: { assignee: true, project: true },
            });

            if (!task) return;

            if (task.status !== "DONE") {
                await step.run("send-task-reminder-mail", async () => {
                    await sendEmail({
                        to: task.assignee.email,
                        subject: `Reminder for ${task.project.name}`,
                        body: `
                                    <div style="max-width: 600px;">
                                    <h2>Hi ${task.assignee.name}, 👋</h2>
                                    
                                    <p style="font-size: 16px;">You have a task due in ${task.project.name}:</p>
                                    <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${task.title}</p>
                                    
                                    <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
                                        <p style="margin: 6px 0;"><strong>Description:</strong> ${task.description}</p>
                                        <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
                                    </div>
                                    
                                    <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
                                        View Task
                                    </a>

                                    <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
                                        Please make sure to review and complete it before the due date.
                                    </p>
                                    </div>
                                    `,
                    });
                });
            }
        });
    }
});

// Inngest functions
export const functions = [sendBookingConfirmationEmail];
