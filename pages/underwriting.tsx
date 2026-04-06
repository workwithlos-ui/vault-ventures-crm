import UnderwritingPage from '../src/components/UnderwritingPage';
export default function UnderwritingRoute() {
  return <UnderwritingPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
