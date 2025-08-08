'use server';
/**
 * @fileOverview A general-purpose chatbot flow.
 *
 * - runAssistant - A function that handles chatbot responses.
 */
import { ai } from '@/ai/genkit';
import type { AssistantInput } from './assistant-types';

export async function runAssistant(input: AssistantInput): Promise<string> {
    const { message } = input;
    
    const response = await ai.generate({
        prompt: message,
        model: 'googleai/gemini-1.5-flash-latest',
        system: `You are a friendly and helpful chatbot named Flow. Engage in a friendly conversation with the user.`,
    });

    console.log('AI Response:', JSON.stringify(response, null, 2));

    const outputText = response.text;

    if (!outputText) {
        console.error('AI response was empty or did not contain text.');
        return "I'm not sure how to respond to that. Can you try again?";
    }

    return outputText;
}
