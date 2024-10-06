import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedalIcon, MapIcon, PlaneIcon, GiftIcon } from "@/components/home/Icons";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Accessibility",
    description:
      "Easy to use for all experience levels, ensuring you can make trades anytime, anywhere.",
  },
  {
    icon: <MapIcon />,
    title: "Live Data",
    description:
      "Get real-time stock market updates directly in the app to stay ahead of the curve.",
  },
  {
    icon: <PlaneIcon />,
    title: "Global Trading",
    description:
      "Choose from a variety of exchanges and trade globally with confidence.",
  },
  {
    icon: <GiftIcon />,
    title: "Secure & Scalable",
    description:
      "Our app is built with security at its core and is designed to scale with your investment needs.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className=" text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
      Investing has never been easier! Our app's intuitive design guides you through the process step by step:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
