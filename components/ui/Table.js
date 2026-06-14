"use client";

import { Button, Space, Table as AntTable, Tooltip } from "antd";
import { Eye, FilterXIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import SearchBox from "./SearchBox";

const statusStyles = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  available: "bg-green-50 text-green-700 border-green-200",

  draft: "bg-amber-50 text-amber-700 border-amber-200",
  limited: "bg-orange-50 text-orange-700 border-orange-200",

  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",

  preparing: "bg-sky-50 text-sky-700 border-sky-200",

  completed: "bg-indigo-50 text-indigo-700 border-indigo-200",

  paid: "bg-teal-50 text-teal-700 border-teal-200",

  inactive: "bg-red-50 text-red-700 border-red-200",
  out_of_stock: "bg-rose-50 text-rose-700 border-rose-200",

  hidden: "bg-slate-100 text-slate-600 border-slate-200",

  cancelled: "bg-gray-100 text-gray-700 border-gray-300",

  refunded: "bg-purple-50 text-purple-700 border-purple-200",

  on_hold: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

function getValue(row, key) {
  return key?.split(".").reduce((value, part) => value?.[part], row);
}

function StatusCell({ value }) {
  const statusKey = value?.toString().toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex  items-center justify-center rounded-full  px-2.5 py-1 text-xs font-medium capitalize",
        statusStyles[statusKey] || "bg-blue-50 text-blue-700 border-blue-200",
      )}
    >
      {value || "-"}
    </span>
  );
}

function ActionCell({ row, onView, onEdit, onDelete }) {
  const hasCustomAction = onView || onEdit || onDelete;

  if (!hasCustomAction) {
    return (
      <Tooltip title="Actions">
        <Button type="text" icon={<MoreHorizontal size={18} />} />
      </Tooltip>
    );
  }

  return (
    <Space size={4}>
      {onView && (
        <Tooltip title="View">
          <Button
            type="text"
            icon={<Eye size={16} className="text-white" />}
            onClick={(event) => {
              event.stopPropagation();
              onView(row._id, row);
            }}
          />
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Edit">
          <Button
            type="text"
            icon={<Pencil size={16} className="text-white" />}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row._id, row);
            }}
          />
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Delete">
          <Button
            danger
            type="text"
            icon={<Trash2 size={16} className="text-white" />}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row._id, row);
            }}
          />
        </Tooltip>
      )}
    </Space>
  );
}

export default function Table({
  header,
  headers,
  data = [],
  title,
  loading = false,
  rowKey = "id",
  searchPlaceholder = "Search",
  showSearch = true,
  showFilterReset = true,
  onFilterReset,
  onRowClick = () => {},
  onView,
  onEdit,
  onDelete,
  pagination,
  className,
}) {
  const [searchValue, setSearchValue] = useState("");
  const tableHeaders = header || headers || [];

  const filteredData = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return data;

    return data.filter((row) =>
      tableHeaders.some(({ key, value, type }) => {
        if (type === "action") return false;

        const cellValue = getValue(row, key || value);
        return cellValue?.toString().toLowerCase().includes(query);
      }),
    );
  }, [data, searchValue, tableHeaders]);

  const columns = useMemo(
    () =>
      tableHeaders.map((column) => ({
        title: column.title,
        dataIndex: column.value,
        key: column.value,
        align: column.align,
        width: column.width,
        render: (value, row) => {
          const cellValue = value ?? getValue(row, column.value);

          if (column.render) return column.render(cellValue, row);
          if (column.type === "status") return <StatusCell value={cellValue} />;
          if (column.type === "action") {
            return (
              <ActionCell
                row={row}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          }
          if (column.type === "link") {
            return (
              <button
                type="button"
                className="font-medium text-accent hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onRowClick?.(row);
                }}
              >
                {cellValue || "-"}
              </button>
            );
          }
          if (column.type === "bold") {
            return (
              <span className="font-semibold text-foreground">
                {cellValue || "-"}
              </span>
            );
          }
          if (column.type === "isImageMultiple") {
            <Dropdown
              className=""
              overlay={
                <Menu className="overflow-auto max-h-56">
                  {text.name?.map((data, i) => (
                    <Menu.Item key={i}>
                      {data && (
                        <div
                          // to={
                          //   each.view &&
                          //   `/employeeProfile/${text.employeeId[i]}`
                          // }
                          className="flex items-center justify-start gap-2"
                        >
                          <div>
                            {text[each.value]?.[i] ? (
                              <div className="overflow-hidden bg-white border-2 border-white rounded-full size-8">
                                <img
                                  key={i}
                                  className="object-cover object-center w-full h-full"
                                  src={text[each.value]?.[i]}
                                  alt=""
                                />
                              </div>
                            ) : (
                              <p className="flex items-center justify-center font-semibold border-2 border-white rounded-full size-8 bg-primaryLight text-primary">
                                {data?.charAt(0).toUpperCase()}
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-md text-grey">
                            {data?.charAt(0).toUpperCase() + data?.slice(1)}
                          </p>
                          {/* Status Icon */}
                          {text.statusdot?.[i] && (
                            <div className="ml-2">
                              {text.statusdot?.[i] === "Approved" && (
                                <span className="relative inline-block w-2 h-2 bg-green-500 rounded-full">
                                  <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                                </span>
                              )}
                              {text.statusdot?.[i] === "Rejected" && (
                                <span className="relative inline-block w-2 h-2 bg-red-500 rounded-full">
                                  <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                                </span>
                              )}
                              {text.statusdot?.[i] === "Pending" && (
                                <span className="relative inline-block w-2 h-2 bg-yellow-500 rounded-full">
                                  <span className="absolute inline-flex w-full h-full bg-yellow-400 rounded-full opacity-75 animate-ping"></span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                  <div className="flex items-center gap-1 pl-4">
                    {text.adminData && (
                      <>
                        {text.adminData.profilePicture ? (
                          <div className="overflow-hidden bg-white border-2 border-white rounded-full size-8">
                            <img
                              key={i}
                              className="object-cover object-center w-full h-full"
                              src={text.adminData.profilePicture}
                              alt=""
                            />
                          </div>
                        ) : (
                          <p className="flex items-center justify-center font-semibold border-2 border-white rounded-full size-8 bg-primaryLight text-primary">
                            {text.adminData.fullName.charAt(0).toUpperCase()}
                          </p>
                        )}

                        <p className="font-semibold text-md text-grey">
                          {text.adminData.fullName}
                        </p>
                        <div className="ml-2">
                          {text.mainStatus === "Approved" && (
                            <span className="relative inline-block w-2 h-2 bg-green-500 rounded-full">
                              <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                            </span>
                          )}
                          {text.mainStatus === "Rejected" && (
                            <span className="relative inline-block w-2 h-2 bg-red-500 rounded-full">
                              <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </Menu>
              }
              // placement={"top"}
              trigger={["hover"]}
            >
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {text[each.value]?.map((data, index) =>
                  text.name?.[index] && index < 3 ? (
                    data ? (
                      <div className="overflow-hidden bg-white border-2 border-white rounded-full size-8">
                        <img
                          key={index}
                          className="object-cover object-center w-full h-full"
                          src={data}
                          alt=""
                        />
                      </div>
                    ) : (
                      <div className="">
                        <p className="flex items-center justify-center font-semibold border-2 border-white rounded-full size-8 bg-primaryLight text-primary">
                          {
                            text.name?.map((each) =>
                              each?.charAt(0).toUpperCase(),
                            )[index]
                          }
                        </p>
                      </div>
                    )
                  ) : (
                    index === 3 && (
                      <div className="flex items-center justify-center p-1 overflow-hidden text-center bg-red-100 border-2 border-white rounded-full size-8 ">
                        <HiPlusSm className="text-sm text-red-600 " />
                        <p className=" text-[10px] font-semibold text-red-600">
                          {text[each?.value]?.length - 3}
                        </p>
                      </div>
                    )
                  ),
                )}
              </div>
            </Dropdown>;
          }

          return cellValue ?? "-";
        },
      })),
    [onDelete, onEdit, onRowClick, onView, tableHeaders],
  );

  const resetFilters = () => {
    setSearchValue("");
    onFilterReset?.();
  };

  return (
    <div className={cn(" flex flex-col gap-6 rounded-lg ", className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {title && (
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        )}

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center">
          {showSearch && (
            <SearchBox
              parentClass="w-full sm:w-72"
              placeholder={searchPlaceholder}
              change={setSearchValue}
              value={searchValue}
            />
          )}

          {showFilterReset && (
            <Tooltip title="Clear filters">
              <Button
                className="!border-border !bg-muted/35 !text-muted-foreground hover:!border-primary hover:!bg-muted/60 hover:!text-foreground disabled:!border-border disabled:!bg-muted/20 disabled:!text-muted-foreground/50"
                icon={<FilterXIcon size={16} />}
                onClick={resetFilters}
                disabled={!searchValue && !onFilterReset}
              />
            </Tooltip>
          )}
        </div>
      </div>

      <AntTable
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record[rowKey] ?? record?.key}
        scroll={{ x: "max-content" }}
        bordered={false}
        loading={loading}
        pagination={
          pagination === false
            ? false
            : {
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
                ...pagination,
              }
        }
        className="employee-cost-table"
        size="middle"
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
        })}
      />
    </div>
  );
}
