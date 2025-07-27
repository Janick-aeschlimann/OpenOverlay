import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { GetAPI, PostAPI } from "@/services/RequestService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const InvitePage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [invite, setInvite] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvite = async () => {
      const response = await GetAPI(`/invite/${token}`);
      if (response.success) {
        setInvite(response.data);
        if (response.data.joined) {
          setError("You already joined this workspace");
        }
      } else {
        setError(response.error);
      }
    };
    fetchInvite();
  }, []);

  const acceptInvite = async () => {
    const response = await PostAPI(`/invite/${token}`, {});

    if (response.success) {
      window.location.replace(`/workspace/${response.data.slug}`);
    } else {
      setError(response.error);
    }
  };

  return (
    <>
      <div className="bg-muted flex h-full flex-col items-center justify-center">
        <form onSubmit={(e) => e.preventDefault()}>
          <Card className="w-xl">
            <CardHeader>
              <CardTitle>Workspace Invitation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                {invite && (
                  <p>
                    You Got invited by{" "}
                    <strong>{invite.inviter.username}</strong> to join{" "}
                    <strong>{invite.workspace.name}</strong>
                  </p>
                )}
                {error && <p className="text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-row gap-2">
              <Button
                disabled={error != null}
                type="submit"
                className="cursor-pointer"
                onClick={() => acceptInvite()}
              >
                Accept
              </Button>
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
};

export default InvitePage;
