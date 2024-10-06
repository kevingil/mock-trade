export const Statistics = () => {
  interface statsProps {
    quantity: string;
    description: string;
  }

  const stats: statsProps[] = [
    {
      quantity: "10,000K+",
      description: "Users",
    },
    {
      quantity: "$10billion+",
      description: "In Trades",
    },
    {
      quantity: "$0",
      description: "Fees",
    },
  ];

  return (
    <section id="statistics">
      <div className="grid grid-cols-3 gap-8">
        {stats.map(({ quantity, description }: statsProps) => (
          <div
            key={description}
            className="space-y-2 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold ">{quantity}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
