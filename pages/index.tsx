import DashboardPage from '../src/components/DashboardPage';
export default function Home() {
  return <DashboardPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
