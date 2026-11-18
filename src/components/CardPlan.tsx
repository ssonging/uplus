import Button from "@/components/Button";
import Tag from "@/components/Tag";

// Figma Card/Plan. 지금은 State=default, Promo=false, Sale=false만 쓴다.
// 구조: badge(Tag) → Name → Desc → price-row[Price + Button]. 패딩 20, 간격 8, radius/16, border/default 1.
type CardPlanProps = {
  state?: "default";
  badge: boolean;
  badgeLabel?: string;
  name: string;
  desc: string;
  price: string;
  buttonLabel: string;
  href: string;
};

export default function CardPlan({ badge, badgeLabel, name, desc, price, buttonLabel, href }: CardPlanProps) {
  return (
    <article className="flex flex-col gap-8 rounded-16 border border-border-default bg-bg-surface p-20">
      {badge ? <Tag label={badgeLabel} /> : null}
      <h3 className="text-subtitle font-bold text-text-primary">{name}</h3>
      <p className="text-body-small font-medium text-text-secondary">{desc}</p>
      <div className="flex items-center justify-between gap-8">
        <p className="text-subtitle font-bold text-text-primary">{price}</p>
        <Button type="Secondary" size="sm" href={href}>
          {buttonLabel}
        </Button>
      </div>
    </article>
  );
}
