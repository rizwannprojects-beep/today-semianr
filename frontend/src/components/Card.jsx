export const Card = ({
  children,
  className = '',
  hover = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#D9E2E8] rounded-xl p-5 shadow-xs transition-all duration-200 text-[#16324F] ${
        hover
          ? 'hover:border-[#00897B] hover:shadow-md hover:bg-[#F0F7F6]/60 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
