interface FlagProps {
  code: string;
  size?: number;
}

export function Flag({ code, size = 20 }: FlagProps) {
  if (code === 'GR') {
    return (
      <svg width={size} height={Math.round(size * 0.667)} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#0D5EAF"/>
        <rect y="0" width="30" height="2.22" fill="#fff"/>
        <rect y="4.44" width="30" height="2.22" fill="#fff"/>
        <rect y="8.89" width="30" height="2.22" fill="#fff"/>
        <rect y="13.33" width="30" height="2.22" fill="#fff"/>
        <rect y="17.78" width="30" height="2.22" fill="#fff"/>
        <rect width="12" height="11.11" fill="#0D5EAF"/>
        <rect x="4.8" y="0" width="2.4" height="11.11" fill="#fff"/>
        <rect x="0" y="4.44" width="12" height="2.22" fill="#fff"/>
      </svg>
    );
  }
  if (code === 'ES') {
    return (
      <svg width={size} height={Math.round(size * 0.667)} viewBox="0 0 30 20" aria-hidden="true">
        <rect width="30" height="20" fill="#AA151B"/>
        <rect y="5" width="30" height="10" fill="#F1BF00"/>
      </svg>
    );
  }
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{code}</span>;
}
