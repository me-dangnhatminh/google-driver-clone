import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useAuth0 } from "@auth0/auth0-react";
import { PaymentApi } from "@api";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@components/spinner";
import { toast } from "sonner";

function UserMenu() {
  const { user, logout } = useAuth0();

  const fetchBillingPortal = useQuery({
    queryKey: ["billing-portal"],
    queryFn: () =>
      PaymentApi.getCustomerBillingPortal({
        return_url: location.href,
      }),
  });

  const navigateTo = (url: string) => {
    toast("Redirecting to billing portal...");
    window.location.href = url;
  };

  if (!user) return null;

  const name = user.name ?? "";
  const email = user.email;
  const avatarURI = user.picture;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div role="button">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarURI ?? ""} />
            <AvatarFallback children={name[0]} />
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 mx-2"
        align="start"
        alignOffset={11}
        forceMount
      >
        <div className="flex flex-col space-y-2 p-2">
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarURI ?? ""} />
                <AvatarFallback children={name[0]} />
              </Avatar>
            </div>

            <div className="text-sm overflow-hidden truncate">
              <p className="font-semibold">{name}</p>
              <p className="opacity-75" children={email} />
            </div>
          </div>

          <DropdownMenuSeparator />
          <div>
            {!fetchBillingPortal.isError && (
              <DropdownMenuItem
                onClick={() => {
                  if (fetchBillingPortal.data?.url) {
                    navigateTo(fetchBillingPortal.data.url);
                  }
                }}
                className="w-full cursor-pointer text-muted-foreground"
              >
                {fetchBillingPortal.isLoading && <Spinner />}
                {fetchBillingPortal.data?.url && "Billing Portal"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="w-full cursor-pointer text-muted-foreground"
              children="Account"
            />
            <DropdownMenuItem
              className="w-full cursor-pointer text-muted-foreground"
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              children="Logout"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
