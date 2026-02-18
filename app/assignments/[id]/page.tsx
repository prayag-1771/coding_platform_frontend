import AssignmentClient from "./AssignmentClient";

export default async function Page(props: any) {
  const { id } = await props.params;

  return <AssignmentClient assignmentId={id} />;
}
