export interface NavItem {
    label: string;
    href: string;
  }
  
export interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
  
export interface PricingTier {
    name: string;
    price: number;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
  }
  
export interface FooterSection {
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }
  