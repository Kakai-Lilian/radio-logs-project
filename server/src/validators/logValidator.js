import { z } from "zod";

export const logSchema = z.object({
  date_time: z
    .string()
    .min(1, "Date & time is required")
    .refine(
      (val) => !isNaN(new Date(val).getTime()),
      "Invalid date format, use YYYY-MM-DD HH:mm:ss"
    ),
  radio: z.string().min(1, "Radio name is required"),
  status: z.enum(["online", "offline"], {
    errorMap: () => ({ message: "Status must be 'online' or 'offline'" }),
  }),
  issue: z.string().optional().nullable(),
});
