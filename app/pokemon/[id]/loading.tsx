const bar = (
  width: string | number,
  height: number,
  radius: number | string = 8,
) => (
  <span
    className="skeleton-bar"
    style={{ width, height, borderRadius: radius }}
  />
);

function StackSkeleton({ variant }: { variant: "side" | "far" }) {
  return (
    <div className={`stack-card stack-card-${variant}`}>
      <div
        className="skeleton-bar"
        style={{
          width: variant === "far" ? "60%" : "80%",
          aspectRatio: "1 / 1",
          borderRadius: 16,
        }}
      />
      {variant === "side" && (
        <div
          className="stack-card-meta"
          style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}
        >
          {bar(40, 12)}
          {bar(90, 14)}
        </div>
      )}
    </div>
  );
}

function PanelSkeleton({
  area,
  rows,
  height,
}: {
  area: string;
  rows: number;
  height?: number;
}) {
  return (
    <section className={`panel panel-${area}`} style={{ minHeight: height }}>
      <div className="panel-h">{bar(120, 16)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <span
            key={i}
            className="skeleton-bar"
            style={{ width: `${95 - i * 6}%`, height: 14, borderRadius: 8 }}
          />
        ))}
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <div className="app">
      <header className="filter-bar">
        <div className="filter-bar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {bar(40, 40, 14)}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {bar(120, 16)}
              {bar(80, 11)}
            </div>
          </div>
        </div>
        <div className="pills-row">
          <div className="pills-scroll">{bar(160, 13)}</div>
        </div>
      </header>
      <main className="main">
        <div className="focus-wrap">
          <div className="stack-row">
            <StackSkeleton variant="far" />
            <StackSkeleton variant="side" />
            <div className="focus-hero">
              <div
                className="focus-hero-top"
                style={{ position: "relative", zIndex: 1 }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {bar(56, 22, 999)}
                  {bar(56, 22, 999)}
                </div>
                {bar(60, 14)}
              </div>
              <div
                className="skeleton-bar focus-hero-art"
                style={{ borderRadius: "50%" }}
              />
              {bar("60%", 36, 10)}
              <div style={{ marginTop: 10 }}>{bar(140, 14)}</div>
              <div className="focus-hero-meta">
                <div>
                  {bar(50, 10)}
                  <div style={{ marginTop: 6 }}>{bar(80, 15)}</div>
                </div>
                <div>
                  {bar(50, 10)}
                  <div style={{ marginTop: 6 }}>{bar(80, 15)}</div>
                </div>
              </div>
            </div>
            <StackSkeleton variant="side" />
            <StackSkeleton variant="far" />
          </div>

          <div className="detail-paginator">
            {bar(40, 40, 999)}
            {bar(80, 18)}
            {bar(40, 40, 999)}
          </div>

          <div className="detail-grid">
            <PanelSkeleton area="stats" rows={6} />
            <PanelSkeleton area="matchups" rows={5} />
            <PanelSkeleton area="moves" rows={8} height={420} />
            <PanelSkeleton area="evo" rows={3} height={220} />
          </div>
        </div>
      </main>
    </div>
  );
}
