import React from "react";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
}) => {
  const reqs = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
    { label: "Special character (!@#$)", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-3 p-3.5 bg-surface border border-line rounded-xl font-mono text-xs">
      <p className="text-muted mb-2 font-medium">Password Requirements:</p>
      <div className="grid grid-cols-2 gap-2">
        {reqs.map((req, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              req.pass ? "text-success" : "text-muted"
            }`}
          >
            <span>{req.pass ? "✓" : "○"}</span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
