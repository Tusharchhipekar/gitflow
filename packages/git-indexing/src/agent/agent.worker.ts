import { ChatMistralAI } from "@langchain/mistralai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import dotenv from "dotenv";
dotenv.config();
const PROVIDER = process.env.LLM_PROVIDER ?? "mistral";

export function getModel(): BaseChatModel {
  switch (PROVIDER) {
    case "mistral":
      if (!process.env.MISTRAL_API_KEY) {
        throw new Error("MISTRAL_API_KEY is not set in the environment");
      }
      return new ChatMistralAI({
        apiKey: process.env.MISTRAL_API_KEY,
        model: "mistral-large-latest",
        temperature: 0.2,
      }) as unknown as BaseChatModel;

    case "anthropic": {
      // Uncomment once you `bun add @langchain/anthropic` for production:
      //
      // const { ChatAnthropic } = require("@langchain/anthropic");
      // if (!process.env.ANTHROPIC_API_KEY) {
      //   throw new Error("ANTHROPIC_API_KEY is not set in the environment");
      // }
      // return new ChatAnthropic({
      //   apiKey: process.env.ANTHROPIC_API_KEY,
      //   model: "claude-sonnet-4-6",
      //   temperature: 0.2,
      // });
      throw new Error(
        "LLM_PROVIDER=anthropic set, but @langchain/anthropic isn't wired up yet. " +
          "Run `bun add @langchain/anthropic` and uncomment the block in model.ts.",
      );
    }

    default:
      throw new Error(`Unknown LLM_PROVIDER: ${PROVIDER}`);
  }
}
