"use client";

import { useState, useEffect } from "react";

const TOUR_KEY = "mtj-tour-completed";

const steps = [
  {
    title: "Tu panel de traductor",
    desc: "Aquí ves tus KPIs, pedidos activos y acciones rápidas. Este es tu centro de operaciones.",
    icon: "📊",
  },
  {
    title: "Completa tu perfil",
    desc: "Añade tu foto, biografía y tarifas. Los clientes te encontrarán en el directorio público.",
    icon: "👤",
  },
  {
    title: "Configura Stripe",
    desc: "Ve a Pagos y suscripción para conectar tu cuenta bancaria y empezar a cobrar a clientes.",
    icon: "💳",
  },
  {
    title: "Suscríbete al Plan Fundador",
    desc: "Por 49€/mes accedes al editor bilingüe, firma eIDAS, Verifactu, red de colegas y más.",
    icon: "⭐",
  },
  {
    title: "Recibe tu primer pedido",
    desc: "Comparte tu perfil público o instala el widget en tu web para empezar a recibir encargos.",
    icon: "📥",
  },
];

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not showing

  useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      setCurrentStep(0);
    }
  }, []);

  function next() {
    if (currentStep >= steps.length - 1) {
      localStorage.setItem(TOUR_KEY, "true");
      setCurrentStep(-1);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "true");
    setCurrentStep(-1);
  }

  if (currentStep < 0) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 9998,
        }}
      />

      {/* Tour card */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          background: "#fff",
          borderRadius: 12,
          padding: "28px 24px 20px",
          width: 380,
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: i === currentStep ? "#C9882A" : "#E8E2D8",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 32, marginBottom: 12 }}>{step.icon}</div>

        {/* Content */}
        <h3
          className="font-playfair"
          style={{ fontSize: 18, color: "#1A3A2A", marginBottom: 6 }}
        >
          {step.title}
        </h3>
        <p
          className="font-sans"
          style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20 }}
        >
          {step.desc}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={dismiss}
            className="font-sans"
            style={{
              background: "none",
              border: "none",
              color: "#999",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Saltar tour
          </button>

          <button
            onClick={next}
            className="font-sans"
            style={{
              background: "#1A3A2A",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {currentStep >= steps.length - 1 ? "Empezar" : "Siguiente"}
          </button>
        </div>

        {/* Step counter */}
        <p
          className="font-mono"
          style={{ textAlign: "center", fontSize: 10, color: "#bbb", marginTop: 12 }}
        >
          {currentStep + 1} / {steps.length}
        </p>
      </div>
    </>
  );
}
