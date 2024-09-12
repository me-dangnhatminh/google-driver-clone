import { Stack } from "@mui/joy";

export type LandingLayoutProps = {
  header: React.ReactNode;
  main: React.ReactNode;
};
function LandingLayout(props: LandingLayoutProps) {
  return (
    <Stack
      display="grid"
      width="100dvw"
      height="100dvh"
      overflow="hidden"
      position="relative"
      gridTemplateAreas={`
      "header"
      "main"
      `}
      gridTemplateRows="auto 1fr"
      gridTemplateColumns="1fr"
    >
      <Stack component="header" gridArea="header" children={props.header} />
      <Stack
        component="main"
        gridArea="main"
        overflow="hidden"
        children={props.main}
      />
    </Stack>
  );
}

export default LandingLayout;
