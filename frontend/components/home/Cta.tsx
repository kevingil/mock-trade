import Image from "next/link";

export const Cta = () => {
  return (
    <section
      id="cta"
      className="bg-muted/50 py-16 my-24 sm:my-32 px-4 sm:px-8 rounded-lg"
    >
      <div className="lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            Your
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {" "}
              Stocks{" "}
            </span>
            In One Place
          </h2>
          <p className="text-muted-foreground mt-4 mb-8 lg:mb-0">
            Manage all your stock ideas and trades in a single, seamless interface. With live updates, personalized insights, and a platform built for growth, you're always in control. Start trading commission-free today and experience the future of investing.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">

          <img
            src={"/one-place.svg"}
            alt=""
            className=" object-contain mx-auto rounded-lg"/>
        </div>
      </div>
    </section>
  );
};
