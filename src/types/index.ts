interface NavItem {
    label: string;
    href: string;
  }
  
  interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
  
  interface PricingTier {
    name: string;
    price: number;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
  }
  
  interface FooterSection {
    title: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }
  