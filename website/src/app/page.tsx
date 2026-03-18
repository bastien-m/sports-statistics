import Link from "next/link";
import {
  CircleDot,
  Shield,
  Hand,
  Trophy,
  BarChart3,
  ArrowLeftRight,
  Icon,
  HandFist,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { basketball, rugby, soccerBall } from "@lucide/lab";

const sports = [
  {
    title: "Football",
    description:
      "Results, standings and statistics for football leagues worldwide.",
    url: "/football",
    icon: <Icon iconNode={soccerBall} />,
  },
  {
    title: "Rugby",
    description: "Match data and rankings across major rugby competitions.",
    url: "/rugby",
    icon: <Icon iconNode={rugby} />,
  },
  {
    title: "Handball",
    description: "Scores and performance data from top handball leagues.",
    url: "/handball",
    icon: <HandFist />,
  },
  {
    title: "Basketball",
    description: "Game stats and standings from basketball leagues.",
    url: "/basketball",
    icon: <Icon iconNode={basketball} />,
  },
];

const tools = [
  {
    title: "Leagues",
    description: "Browse and compare leagues side by side across all sports.",
    url: "/leagues",
    icon: BarChart3,
  },
  {
    title: "Compare",
    description:
      "Pick any two teams or leagues and compare their stats head to head.",
    url: "/compare",
    icon: ArrowLeftRight,
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero */}
      <div className="space-y-3 pt-4">
        <h1 className="text-4xl font-bold tracking-tight">Sport Data</h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          Historical match data, standings, and statistics for football, rugby,
          handball, and basketball — all in one place.
        </p>
      </div>

      {/* Sports */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Sports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sports.map(({ title, description, url, icon: Icon }) => (
            <Link key={title} href={url} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/30">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="size-5 text-muted-foreground">{Icon}</div>
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Analysis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map(({ title, description, url, icon: Icon }) => (
            <Link key={title} href={url} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/30">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <Icon className="size-5 text-muted-foreground" />
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
