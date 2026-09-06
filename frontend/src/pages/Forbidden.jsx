import ErrorScreen from '../components/ErrorScreen';
import SternFace from '../components/SternFace';
export default function Forbidden() {
  return (
    <ErrorScreen
      icon={<SternFace />}
      code="403"
      title="Access denied."
      message="You don't have permission to view this page."
    />
  );
}
