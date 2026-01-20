type PageLoaderProps = {
  fullscreen?: boolean;
  className?: string;
  spinnerClassName?: string;
};

const PageLoader = ({ fullscreen = true, className = "", spinnerClassName = "" }: PageLoaderProps) => {
  const containerClasses = fullscreen
    ? "fixed inset-0 z-[100] flex items-center justify-center bg-white"
    : "flex items-center justify-center w-full";

  return (
    <div className={`${containerClasses} ${className}`.trim()}>
      <div
        className={`h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent ${spinnerClassName}`.trim()}
      />
    </div>
  );
};

export default PageLoader;


