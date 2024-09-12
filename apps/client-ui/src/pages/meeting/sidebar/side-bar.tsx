import * as Tabs from "@radix-ui/react-tabs";
import ListParticipant from "./list-participant";
import AccessControl from "./access-control";

function SideBar() {
  return (
    <Tabs.Root className="w-full h-full bg-black" defaultValue="access-control">
      <Tabs.Content className="w-full h-full" value="participants">
        <ListParticipant />
      </Tabs.Content>
      <Tabs.Content className="w-full h-full" value="access-control">
        <AccessControl />
      </Tabs.Content>
    </Tabs.Root>
  );
}

export default SideBar;
