import { Statistics } from "./Statistics";


export const About = () => {
  return (
    <section
      id="about"
      className="py-24 sm:py-32"
    >
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <img
            src={"/trade-money.svg"}
            alt=""
            className="w-[300px] object-contain mx-auto rounded-lg"
          />
          <div className="bg-green-0 flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  About{" "}
                </span>
                Us
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
              Discover an innovative financial app designed to give you more control over your investments. Our app offers zero commission trades, live stock market data, and secure transactions—making it easier than ever to manage your portfolio without hidden fees or delays. Whether you're a seasoned investor or just starting, our user-friendly platform is here to empower you.
              </p>
            </div>

            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};
