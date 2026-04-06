import PortfolioPage from '../src/components/PortfolioPage';
export default function PortfolioRoute() {
  return <PortfolioPage />;
}
export async function getServerSideProps() {
  return { props: {} };
}
