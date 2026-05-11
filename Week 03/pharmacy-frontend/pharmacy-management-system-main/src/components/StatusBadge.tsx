interface StatusBadgeProps {
  status: string;
}

const configs: Record<string, { bg: string; text: string }> = {
  'In Stock':    { bg: '#DCFCE7', text: '#166534' },
  'Low Stock':   { bg: '#FEF3C7', text: '#92400E' },
  'Expired':     { bg: '#FEE2E2', text: '#991B1B' },
  'Out of Stock':{ bg: '#F3F4F6', text: '#374151' },
  'Active':      { bg: '#DCFCE7', text: '#166534' },
  'Inactive':    { bg: '#F3F4F6', text: '#6B7280' },
  'Pending':     { bg: '#FEF3C7', text: '#92400E' },
  'Delivered':   { bg: '#DCFCE7', text: '#166534' },
  'Cancelled':   { bg: '#FEE2E2', text: '#991B1B' },
  'Completed':   { bg: '#DCFCE7', text: '#166534' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = configs[status] ?? { bg: '#F3F4F6', text: '#374151' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {status}
    </span>
  );
}
