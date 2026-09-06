import ErrorScreen from '../components/ErrorScreen';
import CryingFace from '../components/CryingFace';
export default function NotFound() {
  return (
    <ErrorScreen
      icon={<CryingFace />}
      code="404"
      title="Aw, this page went missing."
      message="Whatever you were looking for isn't here — it might have been moved, renamed, or never existed."
    />
  );
}
