interface Props {
  index: string;
  children: React.ReactNode;
  callbackFn: () => void;
}

/**
 * @param {string} children which will be rendered inside the button
 * @param {function} function to alter state or do something else
 * @param {string} index index for each button
 */
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
