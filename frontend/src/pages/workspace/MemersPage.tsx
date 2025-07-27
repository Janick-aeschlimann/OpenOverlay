import CreateInviteModal from "@/components/CreateInviteModal";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/shadcn/ui/button";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import { Input } from "@/components/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { DeleteAPI, GetAPI, PatchAPI } from "@/services/RequestService";
import { useWorkspaceStore } from "@/store/workspace";
import type { Invite, Member } from "@/types/types";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  CircleCheck,
  CircleX,
  Copy,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [invites, setInvites] = useState<Invite[] | null>(null);

  const [roles, setRoles] = useState<any[] | null>(null);

  const { activeWorkspace } = useWorkspaceStore();

  const getMembers = async () => {
    if (activeWorkspace) {
      const response = await GetAPI(
        `/workspace/${activeWorkspace.workspaceId}/member`
      );
      if (response.success) {
        const owner = await GetAPI(`/user/${activeWorkspace.ownerId}`);
        if (owner.success) {
          setMembers([
            { username: owner.data.username, roleId: -1 },
            ...response.data,
          ]);
        }
      } else {
        setMembers(null);
      }
    }
  };

  const getRoles = async () => {
    if (activeWorkspace) {
      const response = await GetAPI(
        `/workspace/${activeWorkspace.workspaceId}/role`
      );
      if (response.success) {
        setRoles(response.data);
      } else {
        setRoles(null);
      }
    }
  };

  const getInvites = async () => {
    if (activeWorkspace) {
      const response = await GetAPI(
        `/workspace/${activeWorkspace.workspaceId}/invite`
      );
      if (response.success) {
        console.log(response.data);
        setInvites(response.data);
      } else {
        setInvites(null);
      }
    }
  };

  const changeMember = async (userId: string, roleId: number) => {
    await PatchAPI(
      `/workspace/${activeWorkspace?.workspaceId}/member/${userId}`,
      { roleId }
    );

    getMembers();
    getRoles();
  };

  const removeMember = async (userId: string) => {
    if (activeWorkspace) {
      const response = await DeleteAPI(
        `/workspace/${activeWorkspace.workspaceId}/member/${userId}`
      );
      if (response.success) {
        getMembers();
        getRoles();
      }
    }
  };

  const removeInvite = async (inviteId: string) => {
    if (activeWorkspace) {
      const response = await DeleteAPI(
        `/workspace/${activeWorkspace.workspaceId}/invite/${inviteId}`
      );
      if (response.success) {
        getInvites();
      }
    }
  };

  useEffect(() => {
    getMembers();
    getRoles();
    getInvites();
  }, [activeWorkspace]);

  const memberColumns: ColumnDef<Member>[] = [
    {
      id: "userId",
      accessorKey: "userId",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <>
          {row.getValue("roleId") == -1 ? (
            <></>
          ) : (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          )}
        </>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "username",
      header: () => <div className="w-36">Username</div>,
      cell: ({ row }) => <div className="w-36">{row.getValue("username")}</div>,
    },
    {
      accessorKey: "roleId",
      header: () => <div className="w-36">Role</div>,
      cell: ({ row }) => (
        <>
          {row.getValue("roleId") == -1 ? (
            <div>Owner</div>
          ) : (
            <Select
              defaultValue={row.getValue("roleId")}
              onValueChange={(value) =>
                changeMember(row.getValue("userId"), parseInt(value))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  {roles?.map((role) => (
                    <SelectItem value={role.roleId}>{role.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={row.getValue("roleId") == -1}
                asChild
              >
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => removeMember(row.getValue("userId"))}
                >
                  <Trash2 className="text-red-400" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const inviteColumns: ColumnDef<Invite>[] = [
    {
      id: "inviteId",
      accessorKey: "workspaceInviteId",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "token",
      header: () => <div>URL</div>,
      cell: ({ row }) => (
        <div className="flex flex-row gap-1">
          <Input
            readOnly
            id="url"
            value={`${window.location.origin}/invite/${row.getValue("token")}`}
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/invite/${row.getValue("token")}`
              );
              (document.getElementById("url") as HTMLInputElement).select();
            }}
          >
            <Copy />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "created_by",
      header: () => <div>Created By</div>,
      cell: ({ row }) => (
        <div>{(row.getValue("created_by") as any).username}</div>
      ),
    },
    {
      accessorKey: "role",
      header: () => <div>Role</div>,
      cell: ({ row }) => <div>{row.getValue("role")}</div>,
    },
    {
      accessorKey: "expires_at",
      header: () => <div>Expires At</div>,
      cell: ({ row }) => (
        <div>
          {row.getValue("expires_at")
            ? formatDistanceToNow(new Date(row.getValue("expires_at")), {
                addSuffix: true,
              })
            : "never"}
        </div>
      ),
    },
    {
      accessorKey: "usages",
      header: () => <div>Usages</div>,
      cell: ({ row }) => <div>{row.getValue("usages")}</div>,
    },
    {
      accessorKey: "max_usages",
      header: () => <div>Max usages</div>,
      cell: ({ row }) => <div>{row.getValue("max_usages") ?? "infinite"}</div>,
    },
    {
      id: "valid",
      header: () => <div>Valid</div>,
      cell: ({ row }) => {
        const expires_at = row.getValue("expires_at");
        const max_usages = row.getValue("max_usages");
        const usages = row.getValue("usages");
        const time_valid = expires_at
          ? new Date(expires_at as string).getTime() > new Date().getTime()
          : true;
        const usage_valid = max_usages
          ? parseInt(usages as string) < parseInt(max_usages as string)
          : true;
        if (usage_valid && time_valid) {
          return <CircleCheck fill="green" />;
        } else {
          return <CircleX fill="red" />;
        }
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => removeInvite(row.getValue("inviteId"))}
                >
                  <Trash2 className="text-red-400" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="h-full p-20">
        <div className="flex flex-col gap-10">
          {members && (
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-lg">Members</h2>
              <DataTable columns={memberColumns} data={members} />
            </div>
          )}
          {invites && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-row justify-between">
                <h2 className="font-semibold text-lg">Invites</h2>
                <CreateInviteModal
                  roles={roles}
                  onCreated={() => {
                    getInvites();
                  }}
                />
              </div>
              <DataTable columns={inviteColumns} data={invites} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Members;
