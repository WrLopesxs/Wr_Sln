import { GlowCard } from "@/components/ui/spotlight-card";

export function Default() {
  return (
    <div className="flex h-screen w-screen flex-row items-center justify-center gap-10">
      <GlowCard />
      <GlowCard glowColor="purple" />
      <GlowCard glowColor="green" />
    </div>
  );
}
