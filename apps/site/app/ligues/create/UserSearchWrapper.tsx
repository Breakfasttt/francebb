"use client";

import { useState, useEffect } from "react";
import UserSearch from "@/common/components/UserSearch/UserSearch";

interface UserSearchWrapperProps {
  initialUsers?: any[];
}

export default function UserSearchWrapper({ initialUsers = [] }: UserSearchWrapperProps) {
  const [selectedUsers, setSelectedUsers] = useState<any[]>(initialUsers);

  useEffect(() => {
    // Update the hidden input in the form
    const input = document.getElementById("commissaireIdsInput") as HTMLInputElement;
    if (input) {
      input.value = selectedUsers.map(u => u.id).join(',');
    }
  }, [selectedUsers]);

  const handleSelect = (user: any) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <UserSearch 
      selectedUsers={selectedUsers}
      onSelect={handleSelect}
      onRemove={handleRemove}
      placeholder="Chercher un commissaire..."
      maxSelections={10}
    />
  );
}
