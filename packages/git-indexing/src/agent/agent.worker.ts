import { ChatMistralAI } from "@langchain/mistralai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function getModel(): BaseChatModel {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in the environment");
  }

  return new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-large-latest",
    temperature: 0.2,
  }) as unknown as BaseChatModel;
}
