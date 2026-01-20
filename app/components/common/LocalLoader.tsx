type LocalLoaderProps = {
  className?: string;
  spinnerClassName?: string;
};

const LocalLoader = ({ className = "", spinnerClassName = "" }: LocalLoaderProps) => {
  return (
    <div className={`flex items-center justify-center w-full py-10 ${className}`.trim()}>
      <div
        className={`h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent ${spinnerClassName}`.trim()}
      />
    </div>
  );
};

export default LocalLoader;