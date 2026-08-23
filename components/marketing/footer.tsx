import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue to-purple opacity-80" />
                <div className="absolute inset-[2px] rounded-[6px] bg-white flex items-center justify-center">
                  <span className="text-blue font-bold text-sm">P</span>
                </div>
              </div>
              <span className="text-lg font-bold">{BRAND.shortName}</span>
            </div>
            <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
              {BRAND.description}
            </p>
          </div>

          {[
            { title: "Product", items: ["How It Works", "Validation Method", "Pricing", "For Startup Studios"] },
            { title: "Resources", items: ["Documentation", "Blog", "Case Studies", "API"] },
            { title: "Company", items: ["About", "Careers", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-5 text-text-primary">{col.title}</h4>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary">
            <span className="text-text-secondary">Don&apos;t build first. Prove first.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}