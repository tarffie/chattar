interface Props {
  index: string;
  children: React.ReactNode;
  callbackFn: () => void;
}

export const HomeButton: React.FC<Props> = ({
  children,
  callbackFn,
  index,
}) => {
  return (
    <button id={index} onClick={callbackFn}>
      {children}
    </button>
  );
};
