import LoginPage from '../src/components/LoginPage';
export default function LoginRoute() {
  return <LoginPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
