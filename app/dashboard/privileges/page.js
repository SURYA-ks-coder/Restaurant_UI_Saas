"use client";

import { useState } from "react";
import { Shield, Users } from "lucide-react";
import TabsNew from "@/components/ui/TabsNew";
import Heading from "@/components/ui/Heading";
import ButtonClick from "@/components/ui/ButtonClick";
import RoleList from "./RoleList";
import UsersList from "./UsersList";
import CreateUpdateRole from "./CreateUpdateRole";

export default function PrivilegesPage() {
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditRole = (id) => {
    setEditRoleId(id);
    setCreateRoleOpen(true);
  };

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
    setCreateRoleOpen(false);
    setEditRoleId(null);
  };

  const mainTabs = [
    {
      id: "roleList",
      title: "Role List",
      icon: <Shield size={14} />,
      content: <RoleList refreshKey={refreshKey} onEdit={handleEditRole} />,
    },
    {
      id: "usersList",
      title: "Users List",
      icon: <Users size={14} />,
      content: <UsersList refreshKey={refreshKey} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 ">
      <div className="flex items-start justify-between">
        <Heading
          title="User Privileges"
          description="Establishing roles and delegating responsibilities"
        />
        <ButtonClick
          BtnType="add"
          buttonName="Create New Role"
          handleSubmit={() => {
            setEditRoleId(null);
            setCreateRoleOpen(true);
          }}
        />
      </div>

      <TabsNew tabs={mainTabs} />

      {createRoleOpen && (
        <CreateUpdateRole
          open={createRoleOpen}
          roleId={editRoleId}
          onOpenChange={(open) => {
            setCreateRoleOpen(open);
            if (!open) setEditRoleId(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
