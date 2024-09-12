import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { useAuth0 } from "@auth0/auth0-react";

function UserMenu() {
  const { user, logout } = useAuth0();

  const signOut = () => logout();

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
            <DropdownMenuItem className="w-full cursor-pointer text-muted-foreground">
              <div role="button">Account</div>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="w-full cursor-pointer text-muted-foreground"
            >
              <div onClick={signOut} role="button" children="Sign out" />
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;
