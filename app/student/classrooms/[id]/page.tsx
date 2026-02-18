import StudentClassroomClient from "./StudentClassroomClient";

export default async function Page(props: any) {
  const { id } = await props.params;

  return <StudentClassroomClient classroomId={id} />;
}
