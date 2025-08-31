import { useState } from "react";
import { Button } from "./components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/shadcn/ui/dialog";
import { Input } from "./components/shadcn/ui/input";
import { Label } from "./components/shadcn/ui/label";
import { ThemeProvider } from "./components/ThemeProvider";
import OverlayEditor from "./pages/Editor/OverlayEditorPage";
import { useUserStore } from "./store/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/shadcn/ui/select";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const userColors = [
  "#30bced",
  "#6eeb83",
  "#ffbc42",
  "#ecd444",
  "#ee6352",
  "#9ac2c9",
  "#8acb88",
  "#1be7ff",
];

const getRandomColor = () => {
  const index = Math.floor(Math.random() * userColors.length);
  return userColors[index];
};

function App() {
  const { user, editUser, setEditUser, setUser } = useUserStore();

  const [isValid, setIsValid] = useState<boolean>(true);
  const [color, setColor] = useState<string>(user?.color ?? getRandomColor());

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-dvh h-dvh max-h-dvh relative overflow-hidden">
          <OverlayEditor />
          {
            <Dialog
              open={user == null || editUser}
              onOpenChange={(open) => {
                if (!open) {
                  setEditUser(false);
                }
              }}
            >
              <form>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Set User Profile</DialogTitle>
                    <DialogDescription>
                      Choose a username and a color which is visible to all
                      other visitors on this demo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        required
                        defaultValue={
                          user?.username ??
                          uniqueNamesGenerator({
                            dictionaries: [adjectives, colors, animals],
                            separator: " ",
                            style: "capital",
                            length: 2,
                          })
                        }
                        onChange={(e) => {
                          if (e.target.value) {
                            setIsValid(true);
                          } else {
                            setIsValid(false);
                          }
                        }}
                      />
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor="color">Color</Label>

                      <Select
                        onValueChange={(value) => setColor(value)}
                        value={color}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {userColors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div
                                style={{
                                  backgroundColor: color,
                                  width: 15,
                                  height: 15,
                                  borderRadius: 5,
                                }}
                              ></div>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={!isValid}
                      onClick={() => {
                        const username = (
                          document.getElementById(
                            "username"
                          ) as HTMLInputElement
                        ).value;
                        if (username && color) {
                          setUser({ username, color });
                          setEditUser(false);
                        }
                      }}
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          }
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
