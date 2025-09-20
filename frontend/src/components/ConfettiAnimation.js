import React, { useEffect, useState } from 'react';

const ConfettiAnimation = ({ show, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 4,
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      }));
      setParticles(newParticles);

      // Animation loop
      const animate = () => {
        setParticles(prev => {
          const updated = prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            rotation: particle.rotation + particle.rotationSpeed,
            life: particle.life - particle.decay
          })).filter(particle => particle.life > 0 && particle.y < window.innerHeight + 20);

          if (updated.length === 0) {
            onComplete?.();
          }

          return updated;
        });
      };

      const intervalId = setInterval(animate, 16); // ~60fps
      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      };
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-sm transition-opacity duration-100"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.life
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;
