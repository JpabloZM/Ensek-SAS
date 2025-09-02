import React from "react";
import "./ParticlesBackground.css";

const ParticlesBackground = ({
  count = 30,
  color = "rgba(255, 255, 255, 0.5)",
}) => {
  return (
    <div className="particles-background">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="particle"
          style={{
            "--particle-color": color,
            "--particle-speed": `${Math.random() * 20 + 10}s`,
            "--particle-size": `${Math.random() * 3 + 1}px`,
            "--particle-start-position": `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticlesBackground;
