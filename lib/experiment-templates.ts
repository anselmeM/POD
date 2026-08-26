export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  budget: number;
  channel: string[];
  variants: { name: string; headline: string; cta: string; positioning: string; trafficAllocation: number }[];
}

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  {
    id: "message",
    name: "Message Test",
    description: "3 variants, different value props, same audience",
    budget: 100,
    channel: ["linkedin", "meta"],
    variants: [
      { name: "Variant A", headline: "Save 10 Hours Per Week", cta: "Get Early Access", positioning: "Time savings", trafficAllocation: 33 },
      { name: "Variant B", headline: "Automate Your Reporting", cta: "Start Free Trial", positioning: "Automation", trafficAllocation: 34 },
      { name: "Variant C", headline: "Reports in Minutes, Not Days", cta: "See How It Works", positioning: "Speed", trafficAllocation: 33 },
    ],
  },
  {
    id: "pricing",
    name: "Pricing Test",
    description: "Same message at 3 price points",
    budget: 100,
    channel: ["meta", "google"],
    variants: [
      { name: "Pricing $49", headline: "AI Reporting for $49/mo", cta: "Start Free Trial", positioning: "$49 anchor", trafficAllocation: 33 },
      { name: "Pricing $99", headline: "AI Reporting for $99/mo", cta: "Start Free Trial", positioning: "$99 anchor", trafficAllocation: 34 },
      { name: "Pricing $199", headline: "AI Reporting for $199/mo", cta: "Start Free Trial", positioning: "$199 anchor", trafficAllocation: 33 },
    ],
  },
  {
    id: "audience",
    name: "Audience Test",
    description: "Same message to 3 segments",
    budget: 150,
    channel: ["linkedin"],
    variants: [
      { name: "Ops Leaders", headline: "Built for Operations Leaders", cta: "Book a Demo", positioning: "Ops", trafficAllocation: 33 },
      { name: "Founders", headline: "Built for Founders", cta: "Book a Demo", positioning: "Founders", trafficAllocation: 34 },
      { name: "Finance", headline: "Built for Finance Teams", cta: "Book a Demo", positioning: "Finance", trafficAllocation: 33 },
    ],
  },
  {
    id: "channel",
    name: "Channel Test",
    description: "Same message across LinkedIn / Meta / Google",
    budget: 150,
    channel: ["linkedin", "meta", "google"],
    variants: [
      { name: "LinkedIn", headline: "Stop Losing Hours to Manual Reporting", cta: "Learn More", positioning: "Channel: LinkedIn", trafficAllocation: 34 },
      { name: "Meta", headline: "Stop Losing Hours to Manual Reporting", cta: "Learn More", positioning: "Channel: Meta", trafficAllocation: 33 },
      { name: "Google", headline: "Stop Losing Hours to Manual Reporting", cta: "Learn More", positioning: "Channel: Google", trafficAllocation: 33 },
    ],
  },
];
