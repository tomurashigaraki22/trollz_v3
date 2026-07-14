import { ShieldCheck, Truck, Lock, Headset } from "lucide-react";
import Section from "../ui/Section";
import { valueProps } from "@/lib/mock/data";

const icons = { ShieldCheck, Truck, Lock, Headset };

export default function ValueProps() {
  return (
    <Section className="py-10 sm:py-12">
      <div className="grid grid-cols-2 gap-6 rounded-2xl border border-ink-100 bg-ink-50 p-6 sm:p-8 lg:grid-cols-4">
        {valueProps.map((item) => {
          const Icon = icons[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-0.5 text-xs leading-5 text-ink-500">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
