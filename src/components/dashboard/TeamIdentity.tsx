export interface TeamIdentityProps {
  teamName: string;
  managerName: string;
}

export function TeamIdentity(props: TeamIdentityProps) {
  const { teamName, managerName } = props;

  return (
    <header role="banner">
      <h1 className="text-2xl font-bold text-foreground">{teamName}</h1>
      <p className="text-muted-foreground">Manager: {managerName}</p>
    </header>
  );
}
