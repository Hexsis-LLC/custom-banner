import { z } from "zod";

export const otherFieldSchema = z.object({
  displayBeforeDelay: z.string().default('none'),
  showAfterClosing: z.string().default('none'),
  showAfterCTA: z.string().default('none'),
  selectedPages: z.array(z.string()).default(["__global"]).transform(pages => 
    pages.length === 0 ? ["__global"] : pages
  ),
  campaignTiming: z.string(),
});

export type OtherFieldData = z.infer<typeof otherFieldSchema>; 