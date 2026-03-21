import React from "react";

interface HeroGreetingProps {
  userName: string;
}

const HeroGreeting: React.FC<HeroGreetingProps> = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="mb-16">
      <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mb-2">
        {getGreeting()}, {userName}.
      </h1>
    </section>
  );
};

export default HeroGreeting;
