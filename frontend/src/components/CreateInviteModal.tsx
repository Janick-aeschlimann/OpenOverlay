import { Button } from "./shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Label } from "@/components/shadcn/ui/label";
import { ChevronDownIcon, Copy, UserRoundPlus } from "lucide-react";
import { Checkbox } from "./shadcn/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./shadcn/ui/select";
import { Input } from "./shadcn/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./shadcn/ui/popover";
import { useEffect, useState } from "react";
import { Calendar } from "./shadcn/ui/calendar";
import { formatDistanceToNow } from "date-fns";
import { PostAPI } from "@/services/RequestService";
import { useWorkspaceStore } from "@/store/workspace";

interface CreateInviteModalProps {
  roles: any[] | null;
  onCreated: () => void;
}

const CreateInviteModal: React.FC<CreateInviteModalProps> = (props) => {
  const { activeWorkspace } = useWorkspaceStore();

  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<Date | undefined>(
    new Date(Date.now() + 3600000)
  );
  const [role, setRole] = useState<string | null>(null);

  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const [infiniteUses, setInfiniteUses] = useState(false);
  const [neverExpires, setNeverExpires] = useState(false);

  const [isCreated, setIsCreated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (date && time) {
      const [hours, minutes, seconds] = time
        .toLocaleTimeString()
        .slice(0, 8)
        .split(":")
        .map(Number);
      const combined = new Date(date);
      combined.setHours(hours);
      combined.setMinutes(minutes);
      combined.setSeconds(seconds);

      setExpiresAt(combined);
    }
  }, [date, time]);

  const createInvite = async () => {
    const max_usages = infiniteUses
      ? null
      : (document.getElementById("max-uses") as HTMLInputElement).value;
    const expires_at = neverExpires ? null : expiresAt?.toISOString();

    console.log(expires_at);

    if (activeWorkspace) {
      const response = await PostAPI(
        `/workspace/${activeWorkspace.workspaceId}/invite/create`,
        { roleId: role, max_usages, expires_at }
      );

      if (response.success) {
        props.onCreated();
        setIsCreated(true);
        setToken(response.data.token);
      }
    }
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (open == true) {
            setIsCreated(false);
            setToken(null);
            setDate(new Date());
            new Date(Date.now() + 3600000);
            setRole(null);
            setInfiniteUses(false);
            setNeverExpires(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <UserRoundPlus />
            invite
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          {isCreated ? (
            <>
              <DialogHeader>
                <DialogTitle>Invite Created</DialogTitle>
                <DialogDescription>
                  Send This link to invite people into your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-row gap-2">
                  <Input
                    readOnly
                    id="url"
                    value={`${window.location.origin}/invite/${token}`}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/invite/${token}`
                      );
                      (
                        document.getElementById("url") as HTMLInputElement
                      ).select();
                    }}
                  >
                    <Copy />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} variant="outline">
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create Invite</DialogTitle>
                <DialogDescription>
                  Create an link to invite other people to join this workspace
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-row gap-2 items-center">
                  <Checkbox
                    id="never-expires"
                    checked={neverExpires}
                    onCheckedChange={(value) =>
                      setNeverExpires(value as boolean)
                    }
                  />
                  <Label htmlFor="never-expires">Never expires</Label>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <Checkbox
                    id="infinite-uses"
                    checked={infiniteUses}
                    onCheckedChange={(value) =>
                      setInfiniteUses(value as boolean)
                    }
                  />
                  <Label htmlFor="infinite-uses">infinite uses</Label>
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <Label>Expires at</Label>
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex flex-col gap-3">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger disabled={neverExpires} asChild>
                          <Button
                            variant="outline"
                            id="date-picker"
                            className="w-32 justify-between font-normal"
                          >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            disabled={{ before: new Date() }}
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setDate(date);
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Input
                        disabled={neverExpires}
                        type="time"
                        id="time-picker"
                        step="1"
                        value={time?.toTimeString().slice(0, 8)}
                        onChange={(e) => {
                          const [hours, minutes, seconds] = e.target.value
                            .split(":")
                            .map(Number);
                          const updatedDate = new Date(date || new Date());
                          updatedDate.setHours(hours, minutes, seconds || 0);
                          setTime(updatedDate);
                        }}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                    {expiresAt && (
                      <p>
                        {formatDistanceToNow(expiresAt, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <Label htmlFor="max-uses">Max usages</Label>
                  <Input
                    disabled={infiniteUses}
                    id="max-uses"
                    defaultValue={1}
                    className="max-w-24"
                    type="number"
                  />
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <Label>Role</Label>
                  <Select
                    value={role ?? undefined}
                    onValueChange={(value) => setRole(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        {props.roles?.map((role) => (
                          <SelectItem value={role.roleId}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !role || (expiresAt ? expiresAt < new Date() : false)
                  }
                  onClick={() => createInvite()}
                >
                  Create
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateInviteModal;
