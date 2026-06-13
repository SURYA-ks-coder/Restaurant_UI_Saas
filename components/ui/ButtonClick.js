import { Button, Tooltip } from "antd";
import { IoMdAdd } from "react-icons/io";
import { useMediaQuery } from "react-responsive";
import { twMerge } from "tailwind-merge";

export default function ButtonClick({
  handleSubmit = () => {},
  updateFun = () => {},
  updateBtn = false,
  buttonName,
  className,
  BtnType = "", // Updated prop name to avoid conflict with BtnType
  icon,
  iconPosition,
  danger = false,
  tooltip = "",
  size = "",
  variant,
  color,
  style,
  children = false,
  disabled = false,
  tooltipPlacement = "top",
  loading = false,
  rightIcon,
}) {
  const isSmallScreen = useMediaQuery({ maxWidth: 1439 });

  const getButtonType = () => {
    switch (BtnType.toLowerCase()) {
      case "add":
        return "primary";
      case "text":
        return "text";
      case "link":
        return "link";
      case "primary":
        return "primary";
      default:
        return "default"; // Default to "primary" type if the type is not recognized
    }
  };

  return (
    <Tooltip placement={tooltipPlacement} title={tooltip}>
      <Button
        icon={BtnType.toLowerCase() === "add" ? <IoMdAdd /> : icon && icon}
        onClick={(e) => (!updateBtn ? handleSubmit(e) : updateFun())}
        type={getButtonType()}
        size={isSmallScreen ? "default" : size ? size : "large"}
        iconPosition={iconPosition} //start,end
        className={twMerge(
          ` ${
            (BtnType.toLowerCase() === "add" ||
              getButtonType() === "primary") &&
            "bg-accent"
          } ${
            getButtonType() === "default" &&
            "dark:bg-dark3 dark:hover:!bg-[#3f3f3f] dark:hover:!text-white dark:hover:!border-dark3Soft"
          } ${
            danger && BtnType === "primary"
              ? "!bg-[#D92D20]"
              : danger && "border-[#D92D20]"
          } text-xs 2xl:text-sm font-medium w-fit flex items-center justify-center leading-6 z-50`,
          className,
        )}
        disabled={disabled}
        loading={loading}
        danger={danger}
        color={color}
        style={style}
        variant={variant}
      >
        {buttonName && buttonName}

        {rightIcon && rightIcon}
      </Button>
    </Tooltip>
  );
}
