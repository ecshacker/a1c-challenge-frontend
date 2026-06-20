import Link from "next/link";

export default function TestPad() {
  const routes = [
    { name: "01a. Before You Begin", path: "/before-you-begin" },
    { name: "01b. Getting Set Up", path: "/getting-set-up" },
    { name: "02. Enrollment Intake", path: "/enrollment" },
    { name: "03. Start Day One", path: "/day-one" },
    { name: "04. Weekly Check-In", path: "/check-in" },
    { name: "05. Milestone (Week 4)", path: "/milestone" },
  ];

  return (
    <div style={{ padding: "40px 20px", background: "#F7F6F2", borderRadius: "8px", marginTop: "40px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>A1C Challenge — Test Pad</h1>
      <p style={{ color: "#595C50", marginBottom: "32px", fontSize: "15px", lineHeight: "1.5" }}>
        Select a view below to review rendering and verify UI states.
      </p>
      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            style={{
              display: "block",
              padding: "14px 16px",
              background: "#E6E5DD",
              borderRadius: "6px",
              color: "#222420",
              textDecoration: "none",
              fontWeight: 700,
              border: "1px solid #D4D3C8",
            }}
          >
            {route.name} →
          </Link>
        ))}
      </nav>
    </div>
  );
}
