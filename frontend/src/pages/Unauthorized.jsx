import ErrorScreen from '../components/ErrorScreen';
import SleepyFace from '../components/SleepyFace';
export default function Unauthorized() {
  return (
    <ErrorScreen
      icon={<SleepyFace />}
      code="401"
      title="Please log in first."
      message="You need to be logged in to view this page."
      actionLabel="Go to login"
      actionTo="/login"
    />
  );
}
