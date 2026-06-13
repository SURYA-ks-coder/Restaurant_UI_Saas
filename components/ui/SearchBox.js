import { Input } from "antd";
import { HiMiniStar } from "react-icons/hi2";
import { useMediaQuery } from "react-responsive";
import { LuSearch } from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import { FiXCircle } from "react-icons/fi";
export default function SearchBox({
  placeholder = "",
  value = "",
  icon = <LuSearch />,
  error = "",
  className = "",
  parentClass = "",
  change = () => {},
  iconBefore,
  maxLength = 30,
  data = [],
  onSearch = () => {},
  click = () => {},
  disabled = false,
  searchKeys = [],
  type = "text",
}) {
  const isSmallScreen = useMediaQuery({ maxWidth: 1439 });

  const searchFun = (filterValue) => {
    const inputData = filterValue?.toString()?.toLowerCase()?.replace(/ /g, "");
    const searchData = data?.filter((each) => {
      let filteredValues;

      if (searchKeys.length > 0) {
        filteredValues = searchKeys?.some((key) => {
          const value = each[key];

          if (key === "employees" && Array.isArray(value)) {
            // Search within the employees array

            return value.some((employee) =>
              Object.values(employee).some((field) =>
                field
                  ?.toString()
                  ?.toLowerCase()
                  ?.replace(/ /g, "")
                  ?.includes(inputData),
              ),
            );
          } else {
            // Handle single values
            return value
              ?.toString()
              ?.toLowerCase()
              ?.replace(/ /g, "")
              ?.includes(inputData);
          }
        });

        return filteredValues;
      } else {
        // Handle case when no specific keys are provided
        filteredValues = Object.values(each).filter((key) =>
          key
            ?.toString()
            ?.toLowerCase()
            ?.replace(/ /g, "")
            ?.includes(inputData),
        );
        return filteredValues.length > 0;
      }
    });
    if (
      searchKeys.length === 1 &&
      Array.isArray(searchData.flatMap((each) => each[searchKeys[0]]))
    ) {
      const seenEmployeeIds = new Set();

      const uniqueEmployees = searchData
        ?.flatMap((each) =>
          each[searchKeys[0]].filter((value) =>
            Object.values(value).some((key) =>
              key
                ?.toString()
                ?.toLowerCase()
                ?.replace(/ /g, "")
                ?.includes(inputData),
            ),
          ),
        )
        .filter((data) => {
          const isDuplicate = seenEmployeeIds.has(data.employeeId); // Check if the employeeId has been seen
          if (!isDuplicate) {
            seenEmployeeIds.add(data.employeeId); // Mark this employeeId as seen
            return true; // Include this employee
          }
          return false; // Exclude duplicate employees
        });

      onSearch(uniqueEmployees, filterValue);
    } else {
      onSearch(searchData, filterValue);
    }
  };

  const clearFun = () => {
    searchFun("");
    change("");
  };

  return (
    <div className={twMerge("relative", parentClass)}>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        data={data}
        onChange={(e) => {
          const value = e.target.value;
          if (type === "string") {
            const valueData = value?.replace(/[0-9]/g, "");
            searchFun(valueData);
            change(valueData);
          } else {
            searchFun(value);
            change(value);
          }
        }}
        maxLength={maxLength}
        className={twMerge(className)}
        size={isSmallScreen ? "default" : "large"}
        prefix={icon && icon}
        suffix={
          value?.length > 0 ? (
            <span
              onClick={(e) => {
                e.stopPropagation(); // prevents input focus glitch

                clearFun();
              }}
            >
              <FiXCircle className=" text-red-500 cursor-pointer opacity-70" />
            </span>
          ) : (
            <div
              className="invisible"
              // style={{
              //   visibility: "hidden",
              // }}
            >
              <FiXCircle className=" text-red-500 cursor-pointer opacity-70" />
            </div>
          )
        }
        onClick={(e) => {
          click();
        }}
      />

      {error && (
        <p className=" flex justify-start items-center my-1 mb-0 text-[10px] text-red-500">
          <HiMiniStar className="text-[10px]" />
          <span className="text-[10px] pl-1">{error}</span>
        </p>
      )}
    </div>
  );
}
