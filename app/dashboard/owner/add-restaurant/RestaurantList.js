import React from "react";

export default function RestaurantList() {
  return (
    <div className="space-y-4">
      <Table
        header={restaurantHeader}
        data={data}
        title="Restaurant"
        rowKey="_id"
        loading={loading}
        searchPlaceholder="Search Restaurant name"
        onView={() => {}}
        onEdit={(id) => {
          setDepartmentId(id);
          setDrawerOpen(true);
        }}
        onDelete={handleDelete}
      />

      {drawerOpen && (
        <AddRestaurant
          open={drawerOpen}
          onOpenChange={(next) => {
            setDrawerOpen(next);
            if (!next) setDepartmentId(null);
          }}
          onCreated={() => {
            setDepartmentId(null);
            fetchList();
          }}
          updateId={departmentId}
        />
      )}
    </div>
  );
}
