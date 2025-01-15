import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();

import { OPENAI_API_KEY } from "./config";

// Suppress debug logs globally
console.debug = () => {};

export const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
});