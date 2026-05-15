import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { joinWaitlist, getWaitlistCount } from "./db";
import { transcribeAudio } from "./_core/voiceTranscription";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,

  // Waitlist
  waitlist: router({
    join: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(255),
        email: z.string().email(),
        role: z.enum(["athlete", "scout", "coach", "academy", "federation", "other"]),
        sport: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await joinWaitlist(input);
        return { success: true };
      }),
    count: publicProcedure.query(async () => {
      return getWaitlistCount();
    }),
  }),

  // Voice transcription (Whisper fallback for browsers without Web Speech API)
  voice: router({
    transcribe: publicProcedure
      .input(z.object({
        audioUrl: z.string(),
        language: z.string().optional(),
        prompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio(input);
        if ('error' in result) {
          throw new Error(result.error);
        }
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;