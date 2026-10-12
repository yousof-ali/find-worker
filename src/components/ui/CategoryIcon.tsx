export default function CategoryIcon({
  svg,
  className = '',
}: {
  svg?: string;
  className?: string;
}) {
  // icon na thakle ba valid SVG na hole grey box dekhabe
  if (!svg || !/^<svg[\s>]/i.test(svg)) {
    return <div className={`rounded-md bg-slate-200 ${className}`} />;
  }

  return (
    <span
      className={`inline-flex [&>svg]:w-full [&>svg]:h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}