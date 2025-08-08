
'use server';

/**
 * @fileOverview A conversational AI assistant that can manage tasks for a user.
 *
 * - runAssistant - The main function that drives the assistant conversation.
 * - AssistantInput - The input type for the runAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { listTasksTool, addTaskTool, updateTaskTool, deleteTaskTool, getTaskTool } from '@/ai/tools/task-tools';

export type AssistantInput = z.infer<typeof AssistantInputSchema>;
const AssistantInputSchema = z.object({
  userId: z.string().describe('The unique ID of the user.'),
  message: z.string().describe('The user\'s message to the assistant.'),
});


export async function runAssistant(input: AssistantInput): Promise<string> {
    const { userId, message } = input;
    
    const { output, hasToolRequests } = await ai.generate({
        prompt: message,
        tools: [listTasksTool, addTaskTool, updateTaskTool, deleteTaskTool, getTaskTool],
        model: 'googleai/gemini-1.5-flash-latest',
        // By passing the userId in the context, we make it available to all tools
        // without needing to modify the user's prompt.
        context: {
            userId: userId,
        },
        system: `You are a friendly and helpful task management assistant named Flow.
        Your primary goal is to help the user manage their to-do list.
        You can list tasks, add new tasks, update existing tasks, and delete tasks.
        When adding a task, use your reasoning to determine the title, description, priority, etc.
        When a user asks to add a task, do not ask for clarifying details, use your best judgement to populate the fields and add the task. For example, if a user says 'add a task to buy milk', you should create a task with the title 'Buy milk' and reasonable defaults for other fields.
        
        You are also a productivity coach. If a user asks for help or guidance on how to complete a task, you should provide helpful, actionable steps and advice.
        First, use the 'getTask' tool to get the details of the task in question if you need more context.
        Then, offer suggestions, break the task down into smaller sub-tasks, or provide a plan to help the user get started and complete their work.
        For example, if a user asks "how do I finish my 'write a report' task?", you could suggest an outline, research steps, and a writing schedule.

        Always confirm the action you have taken in a friendly and concise way.
        If you do not have a tool to perform an action, or if the question is outside the scope of task management and productivity, politely decline the request.`
    });

    if (!output) {
      if (hasToolRequests) {
        // If the model made a tool call but didn't return a text response,
        // we can provide a generic confirmation.
        return "I've completed your request.";
      } else {
        // This case is unlikely but good to handle.
        return "I'm not sure how to respond to that. Can you try again?";
      }
    }

    return output.text;
}
