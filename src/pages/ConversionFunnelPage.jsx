import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ConversionFunnelPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('conversion_funnel_events')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(2000);
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const funnels = useMemo(() => {
    const byFunnel = {};
    rows.forEach((r) => {
      const name = r.funnel_name || 'Sin nombre';
      if (!byFunnel[name]) byFunnel[name] = { order: [], sessionsByStep: {} };
      if (!byFunnel[name].order.includes(r.step_name)) byFunnel[name].order.push(r.step_name);
      if (!byFunnel[name].sessionsByStep[r.step_name]) byFunnel[name].sessionsByStep[r.step_name] = new Set();
      if (r.session_id) byFunnel[name].sessionsByStep[r.step_name].add(r.session_id);
    });
    return Object.entries(byFunnel).map(([name, data]) => {
      const steps = data.order.map((step) => ({ step, count: data.sessionsByStep[step]?.size || 0 }));
      const max = steps.length ? steps[0].count : 1;
      return {
        name,
        steps: steps.map((s, i) => ({
          ...s,
          pct: max ? Math.round((s.count / max) * 100) : 0,
          dropFromPrev: i > 0 && steps[i - 1].count ? Math.round((1 - s.count / steps[i - 1].count) * 100) : null,
        })),
      };
    });
  }, [rows]);

  return (
    <div className="ro-panel">
      {loading ? (
        <div className="ro-empty">
          <Loader2 size={18} className="ro-spin" /> Cargando…
        </div>
      ) : funnels.length === 0 ? (
        <div className="ro-empty">Todavía no hay datos de embudo registrados.</div>
      ) : (
        funnels.map((f) => (
          <div className="ro-funnel" key={f.name}>
            <h3>{f.name}</h3>
            <div className="ro-funnel-steps">
              {f.steps.map((s) => (
                <div className="ro-funnel-step" key={s.step}>
                  <div className="ro-funnel-bar-wrap">
                    <div className="ro-funnel-bar" style={{ width: `${Math.max(s.pct, 6)}%` }}>
                      <span>{s.count}</span>
                    </div>
                  </div>
                  <div className="ro-funnel-label">
                    <b>{s.step}</b>
                    {s.dropFromPrev !== null && s.dropFromPrev > 0 && (
                      <small className="ro-funnel-drop">-{s.dropFromPrev}% respecto al paso anterior</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}