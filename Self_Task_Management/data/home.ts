/**
 * Type definitions for the data-driven Self Task fanpage / home landing content.
 * All text, CTAs, image references, and structure live in data/home.json.
 * This makes the entire Home UI trivial to edit / A/B test / localize.
 */

export interface Cta {
  text: string;
  href: string;
}

export interface Hero {
  title: string;
  subtitle: string;
  description: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  image?: string; // path under /public, e.g. "/images/hero.jpg" or external placeholder
}

export interface Stat {
  value: string;
  label: string;
}

export interface Feature {
  icon: string; // lucide icon name, e.g. "Zap", "Shield", "CheckSquare"
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string; // image path or external url
}

export interface HowStep {
  step: number;
  title: string;
  description: string;
  icon?: string;
}

export interface DemoTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface DemoSection {
  title: string;
  description?: string;
  tasks: DemoTask[];
}

export interface HomeContent {
  hero: Hero;
  stats: Stat[];
  features: Feature[];
  testimonials: Testimonial[];
  howItWorks: HowStep[];
  demo?: DemoSection;
  finalCta?: {
    title: string;
    description: string;
    primaryCta: Cta;
    secondaryCta?: Cta;
  };
}
