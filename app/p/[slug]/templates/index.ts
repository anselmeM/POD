import React from "react";
import type { LandingPage } from "@/lib/types";

export { IntentModal } from "./IntentModal";
export { HeroTemplate } from "./HeroTemplate";
export { ProblemTemplate } from "./ProblemTemplate";
export { SocialProofTemplate } from "./SocialProofTemplate";
export { PricingTemplate } from "./PricingTemplate";
export { MinimalTemplate } from "./MinimalTemplate";
export { getStoredTrackingParams, fadeIn, stagger } from "./shared";

import { HeroTemplate } from "./HeroTemplate";
import { ProblemTemplate } from "./ProblemTemplate";
import { SocialProofTemplate } from "./SocialProofTemplate";
import { PricingTemplate } from "./PricingTemplate";
import { MinimalTemplate } from "./MinimalTemplate";

export const templateRenderers: Record<string, React.FC<{ page: LandingPage }>> = {
  hero: HeroTemplate,
  problem: ProblemTemplate,
  "social-proof": SocialProofTemplate,
  pricing: PricingTemplate,
  minimal: MinimalTemplate,
};
