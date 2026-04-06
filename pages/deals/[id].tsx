import DealDetailPage from '../../src/components/DealDetailPage';
export default function DealDetailRoute() {
  return <DealDetailPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
